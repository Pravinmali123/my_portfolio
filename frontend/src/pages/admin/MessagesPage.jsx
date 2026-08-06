import { useEffect, useState } from 'react';
import { deleteMessage, getMessages } from '../../services/contentService';
import { useToast } from '../../context/ToastContext';
import { useExpandableList } from '../../hooks/useExpandableList';
import ViewMoreButton from '../../components/ViewMoreButton';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const loadMessages = async () => {
    try {
      const response = await getMessages();
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const promptDelete = (message) => {
    setDeleteTarget(message);
  };

  const cancelDelete = () => setDeleteTarget(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMessage(deleteTarget._id);
      showToast('Message deleted', 's');
      setDeleteTarget(null);
      loadMessages();
    } catch (error) {
      showToast('Unable to delete message', 'e');
      console.error(error);
    }
  };

  const messagesList = useExpandableList(messages, 6);

  return (
    <div className="a-page active" id="page-messages">
      <div className="a-page-header">
        <div className="a-page-title">Manage <span>Messages</span></div>
      </div>
      <div className="a-card">
        <div className="a-card-head">
          <div className="a-card-title">Inbox</div>
          <div className="a-card-count">{messages.length}</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>From</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messagesList.visibleItems.length ? messagesList.visibleItems.map((message, idx) => (
                <tr key={message._id} className={messagesList.getItemClassName(idx)}>
                  <td  data-label="#">{idx + 1}</td>
                  <td data-label="From">
                    {message.name}
                    <div className="muted-text">
                      {message.email ? (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(message.email)}&su=${encodeURIComponent(`Re: ${message.subject || ''}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--cyan)', textDecoration: 'none' }}
                          title="Reply via Email"
                        >
                          {message.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </div>
                  </td>
                  <td  data-label="Phone">
                    {message.phone ? (
                      <a
                        href={`https://wa.me/${message.phone.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--cyan)', textDecoration: 'none' }}
                        title="Chat on WhatsApp"
                      >
                        {message.phone}
                      </a>
                    ) : (
                      <span className="muted-text">—</span>
                    )}
                  </td>
                  <td  data-label="Subject">{message.subject}</td>
                  <td data-label="Status"><span className={`badge badge-${message.status === 'new' ? 'purple' : 'green'}`}>{message.status}</span></td>
                  <td data-label="Received">{new Date(message.createdAt).toLocaleDateString()}</td>
                  <td  className="td-actions" data-label="Actions">
                    <button type="button" className="t-btn del" onClick={() => promptDelete(message)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>
                    No messages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        {messagesList.hasMore && <ViewMoreButton expanded={messagesList.expanded} onClick={messagesList.toggle} />}
      </div>

      {deleteTarget && (
        <div className="modal-ov open del-modal" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="del-icon">🗑️</div>
              <div className="modal-title" style={{ marginBottom: '.6rem' }}>Delete Message</div>
              <div className="del-msg">Delete the message from <strong>{deleteTarget.name}</strong>?</div>
              <div className="del-actions">
                <button type="button" className="del-no" onClick={cancelDelete}>Cancel</button>
                <button type="button" className="del-yes" onClick={handleDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;