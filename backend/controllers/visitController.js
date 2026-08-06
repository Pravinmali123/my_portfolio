import Visit from '../models/Visit.js';
import { parseUserAgent } from '../utils/parseUserAgent.js';

// Pull the real client IP even behind a proxy/load balancer
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  // normalize IPv6-mapped IPv4 addresses like ::ffff:127.0.0.1
  return (raw || 'unknown').replace('::ffff:', '');
};

const isPrivateIp = (ip) =>
  !ip || ip === 'unknown' || ip === '::1' || ip === '127.0.0.1' ||
  ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.');

// Best-effort free IP → city/country lookup. Never blocks or throws upward —
// if it fails or times out, we just save the visit without location data.
const lookupGeo = async (ip) => {
  if (isPrivateIp(ip)) return { country: '', city: '' };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    if (data.status === 'success') {
      return { country: data.country || '', city: data.city || '' };
    }
  } catch (error) {
    // silent — geo lookup is a nice-to-have, not critical
  }
  return { country: '', city: '' };
};

// Record a page view (public endpoint, called from the live portfolio site)
export const trackVisit = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const { browser, os, device } = parseUserAgent(userAgent);
    const page = req.body?.page || '/';
    const referrer = req.body?.referrer || req.headers.referer || 'Direct';

    // Avoid inflating counts: skip logging if the same IP hit the same page
    // in the last 30 minutes (treat it as the same visit/session).
    const recentDuplicate = await Visit.findOne({
      ip,
      page,
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    });
    if (recentDuplicate) {
      return res.status(200).json({ success: true, message: 'Duplicate visit skipped' });
    }

    const { country, city } = await lookupGeo(ip);

    const visit = await Visit.create({
      ip,
      userAgent,
      browser,
      os,
      device,
      page,
      referrer,
      country,
      city,
    });

    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};

// List visits (admin only), most recent first, paginated
export const getVisits = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [visits, total] = await Promise.all([
      Visit.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Visit.countDocuments(),
    ]);

    res.json({
      success: true,
      count: visits.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: visits,
    });
  } catch (error) {
    next(error);
  }
};

// Summary stats for the admin overview dashboard
export const getVisitStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [totalViews, todayViews, uniqueVisitorIps, last7DaysAgg, deviceAgg, recentVisits] =
      await Promise.all([
        Visit.countDocuments(),
        Visit.countDocuments({ createdAt: { $gte: startOfToday } }),
        Visit.distinct('ip'),
        Visit.aggregate([
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Visit.aggregate([
          { $group: { _id: '$device', count: { $sum: 1 } } },
        ]),
        Visit.find().sort({ createdAt: -1 }).limit(10),
      ]);

    res.json({
      success: true,
      data: {
        totalViews,
        todayViews,
        uniqueVisitors: uniqueVisitorIps.length,
        last7Days: last7DaysAgg.map((d) => ({ date: d._id, count: d.count })),
        deviceBreakdown: deviceAgg.map((d) => ({ device: d._id, count: d.count })),
        recentVisits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a single visit record (admin only, e.g. to clear noise/bots)
export const deleteVisit = async (req, res, next) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }
    res.json({ success: true, message: 'Visit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Clear all visit history (admin only)
export const clearVisits = async (req, res, next) => {
  try {
    await Visit.deleteMany({});
    res.json({ success: true, message: 'All visit history cleared' });
  } catch (error) {
    next(error);
  }
};
