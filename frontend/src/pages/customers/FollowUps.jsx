import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, getStatusColor, getErrorMessage } from '../../utils/helpers';
import { CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';

const FollowUps = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      const res = await customerService.getAll({ limit: 100 });
      // Filter customers with follow-up dates, sort by nearest
      const withFollowUps = (res.data.data || [])
        .filter((c) => c.follow_up_date)
        .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));
      setCustomers(withFollowUps);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (date) => new Date(date) < new Date(new Date().toDateString());
  const isToday = (date) => new Date(date).toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Follow-ups</h1>
        <p className="page-subtitle">Upcoming customer follow-ups</p>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : customers.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No follow-ups scheduled" message="Set follow-up dates on customer records" />
        ) : (
          <div className="divide-y divide-gray-100">
            {customers.map((c) => (
              <Link key={c.id} to={`/customers/${c.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.customer_name}</p>
                  <p className="text-xs text-gray-500">{c.business_name || ''}{c.mobile ? ` • ${c.mobile}` : ''}</p>
                  {c.notes && <p className="text-xs text-gray-400 mt-0.5 max-w-md truncate">{c.notes}</p>}
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
                  <span className={`badge ${
                    isOverdue(c.follow_up_date) ? 'badge-danger' : isToday(c.follow_up_date) ? 'badge-warning' : 'badge-info'
                  }`}>
                    {isOverdue(c.follow_up_date) ? 'Overdue' : isToday(c.follow_up_date) ? 'Today' : formatDate(c.follow_up_date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUps;
