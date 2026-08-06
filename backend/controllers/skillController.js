import Skill from '../models/Skill.js';

// Get all skills
export const getSkills = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { status: 'active' };

    if (category && category !== 'ALL') filter.category = category;

    const skills = await Skill.find(filter).sort({ order: 1, category: 1 });

    res.json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

// Get single skill
export const getSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    res.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

// Create skill
export const createSkill = async (req, res, next) => {
  try {
    let payload = req.body;

    if (payload.order === undefined || payload.order === null) {
      const lastSkill = await Skill.findOne().sort({ order: -1 });
      const nextOrder = lastSkill ? lastSkill.order + 1 : 0;
      payload = { ...payload, order: nextOrder };
    }

    const skill = await Skill.create(payload);

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

// Update skill
export const updateSkill = async (req, res, next) => {
  try {
    let skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

// Delete skill
export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    res.json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
