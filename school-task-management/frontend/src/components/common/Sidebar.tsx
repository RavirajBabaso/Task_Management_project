import { NavLink } from 'react-router-dom';
import { DEPARTMENT_HEAD_ROLES, ROLE_LABELS, ROLES } from '../../constants/roles';
import { useAppSelector } from '../../store/hooks';
import Badge from './Badge';

interface NavItem {
  badge?: { tone: 'amber' | 'red'; value: number };
  color: string;
  group: 'Admin' | 'Master' | 'Modules';
  label: string;
  to: string;
}

const chairmanItems: NavItem[] = [
  { color: '#185FA5', group: 'Master', label: 'Dashboard', to: '/chairman' },
  { color: '#2C7BE5', group: 'Modules', label: 'Task Assignment', to: '/chairman/task-assignment' },
  { color: '#10B981', group: 'Modules', label: 'Task Monitor', to: '/chairman/task-monitor' },
  { color: '#D64545', group: 'Modules', label: 'Alerts', to: '/chairman/alerts' },
  { color: '#D89B17', group: 'Modules', label: 'Approvals', to: '/chairman/approvals' },
  { color: '#7C3AED', group: 'Modules', label: 'MIS Reports', to: '/chairman/reports' },
  { color: '#0EA5A4', group: 'Admin', label: 'Announcements', to: '/chairman/announcements' },
  { color: '#F97316', group: 'Admin', label: 'User Management', to: '/chairman/users' },
  { color: '#2563EB', group: 'Admin', label: 'Performance', to: '/chairman/performance' }
];

const departmentItems: NavItem[] = [
  { color: '#185FA5', group: 'Master', label: 'Dashboard', to: '/department' },
  { color: '#2C7BE5', group: 'Modules', label: 'My Tasks', to: '/department/my-tasks' },
  { color: '#D64545', group: 'Modules', label: 'Notifications', to: '/department/notifications' },
  { color: '#0EA5A4', group: 'Admin', label: 'Announcements', to: '/department/announcements' }
];

const directorItems: NavItem[] = [
  { color: '#185FA5', group: 'Master', label: 'Dashboard', to: '/director' }
];

const groups: Array<NavItem['group']> = ['Master', 'Modules', 'Admin'];

function getInitials(name?: string) {
  if (!name) {
    return 'U';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function Sidebar() {
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const pendingApprovals = useAppSelector(
    (state) => state.tasks.tasks.filter((task) => task.status === 'PENDING').length
  );
  const isDepartmentHead = user ? DEPARTMENT_HEAD_ROLES.includes(user.role) : false;

  let items = chairmanItems;

  if (user?.role === ROLES.DIRECTOR) {
    items = directorItems;
  } else if (isDepartmentHead) {
    items = departmentItems;
  }

  const decoratedItems = items.map((item) => {
    if (item.label === 'Alerts') {
      return { ...item, badge: { tone: 'red' as const, value: unreadCount } };
    }

    if (item.label === 'Approvals') {
      return { ...item, badge: { tone: 'amber' as const, value: pendingApprovals } };
    }

    return item;
  });

  return (
    <aside className="flex h-screen w-[196px] shrink-0 flex-col border-r-[0.5px] border-[#EFF2F6] bg-[#F8F9FC]">
      <div className="border-b border-b-[0.5px] border-[#EFF2F6] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-[#185FA5] text-xs font-semibold text-white">
            ET
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-[#1E293B]">EduTask Pro</p>
            <p className="truncate text-[11px] text-[#8A99B0]">
              {user ? ROLE_LABELS[user.role] : 'Master access'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => {
          const groupItems = decoratedItems.filter((item) => item.group === group);

          if (groupItems.length === 0) {
            return null;
          }

          return (
            <div className="mb-5 last:mb-0" key={group}>
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A2AEC1]">
                {group}
              </p>
              <div className="mt-2 space-y-1">
                {groupItems.map((item) => (
                  <NavLink
                    className={({ isActive }) =>
                      [
                        'flex min-h-[34px] items-center justify-between rounded-[10px] border-[0.5px] border-transparent px-2.5 transition',
                        isActive
                          ? 'border-[#E4EAF2] bg-white font-semibold text-[#1E293B]'
                          : 'text-[#5B6E8C] hover:bg-white/80'
                      ].join(' ')
                    }
                    end={item.to === '/chairman' || item.to === '/department' || item.to === '/director'}
                    key={item.to}
                    to={item.to}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-[7px] w-[7px] rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate text-[12px]">{item.label}</span>
                    </span>
                    {item.badge && item.badge.value > 0 ? (
                      <Badge variant={item.badge.tone}>{item.badge.value}</Badge>
                    ) : null}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-t-[0.5px] border-[#EFF2F6] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E6F1FB] text-[11px] font-semibold text-[#0C447C]">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-[#1E293B]">{user?.name ?? 'User'}</p>
            <p className="truncate text-[11px] text-[#8A99B0]">Master access</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
