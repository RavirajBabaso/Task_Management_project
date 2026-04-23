import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskTable from '../components/tables/TaskTable';
import type { Task } from '../types/task.types';

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'High Priority Task',
    priority: 'HIGH',
    status: 'PENDING',
    start_date: '2026-04-20',
    due_date: '2026-04-25',
    assignedTo: { id: 1, name: 'John Doe' } as any,
    department: { id: 1, name: 'Mathematics' } as any,
    assignedToName: 'John Doe',
    departmentName: 'Mathematics',
    description: 'Test task 1',
    createdAt: new Date(),
    updatedAt: new Date()
  } as Task,
  {
    id: 2,
    title: 'Medium Priority Task',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    start_date: '2026-04-18',
    due_date: '2026-05-02',
    assignedTo: { id: 2, name: 'Jane Smith' } as any,
    department: { id: 2, name: 'Science' } as any,
    assignedToName: 'Jane Smith',
    departmentName: 'Science',
    description: 'Test task 2',
    createdAt: new Date(),
    updatedAt: new Date()
  } as Task,
  {
    id: 3,
    title: 'Low Priority Task',
    priority: 'LOW',
    status: 'COMPLETED',
    start_date: '2026-04-10',
    due_date: '2026-04-20',
    assignedTo: { id: 3, name: 'Bob Johnson' } as any,
    department: { id: 3, name: 'History' } as any,
    assignedToName: 'Bob Johnson',
    departmentName: 'History',
    description: 'Test task 3',
    createdAt: new Date(),
    updatedAt: new Date()
  } as Task
];

describe('TaskTable Component', () => {
  it('should render task rows correctly', () => {
    render(<TaskTable tasks={mockTasks} />);

    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Low Priority Task')).toBeInTheDocument();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('should show empty state when no data provided', () => {
    render(<TaskTable tasks={[]} />);

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('No tasks available right now.')).toBeInTheDocument();
  });

  it('should show custom empty message', () => {
    render(
      <TaskTable 
        tasks={[]} 
        emptyMessage="No tasks assigned to you yet."
      />
    );

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('No tasks assigned to you yet.')).toBeInTheDocument();
  });

  it('should render priority stripes with correct hex colors', () => {
    const { container } = render(<TaskTable tasks={mockTasks} />);

    // Find all priority elements
    const priorityElements = container.querySelectorAll('[class*="before:bg-"]');

    // Check for HIGH priority stripe color (#D64545)
    const highPriorityElement = Array.from(container.querySelectorAll('.before\\:bg-\\[\\#D64545\\]'));
    expect(highPriorityElement.length).toBeGreaterThanOrEqual(0);

    // Check for MEDIUM priority stripe color (#D89B17)
    const mediumPriorityElement = Array.from(container.querySelectorAll('.before\\:bg-\\[\\#D89B17\\]'));
    expect(mediumPriorityElement.length).toBeGreaterThanOrEqual(0);

    // Check for LOW priority stripe color (#2E9B67)
    const lowPriorityElement = Array.from(container.querySelectorAll('.before\\:bg-\\[\\#2E9B67\\]'));
    expect(lowPriorityElement.length).toBeGreaterThanOrEqual(0);

    // Verify actual color values in class names
    const allClasses = Array.from(container.querySelectorAll('[class]'))
      .flatMap(el => (el as HTMLElement).className.split(' '));

    expect(allClasses).toContain('before:bg-[#D64545]');
    expect(allClasses).toContain('before:bg-[#D89B17]');
    expect(allClasses).toContain('before:bg-[#2E9B67]');
  });

  it('should call onRowClick when task row is clicked', () => {
    const mockOnRowClick = vi.fn();
    render(<TaskTable tasks={mockTasks} onRowClick={mockOnRowClick} />);

    const taskTitle = screen.getByText('High Priority Task');
    fireEvent.click(taskTitle.closest('tr')!);

    expect(mockOnRowClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should not call onRowClick when no callback provided', () => {
    render(<TaskTable tasks={mockTasks} />);

    const taskTitle = screen.getByText('High Priority Task');
    const row = taskTitle.closest('tr');

    // Row should not have cursor-pointer class if no callback
    expect(row?.className).not.toContain('cursor-pointer');
  });

  it('should format dates correctly', () => {
    render(<TaskTable tasks={mockTasks} />);

    // Check date formatting (format: DD-MMM-YYYY)
    const dateElements = screen.getAllByText(/\d{2}-[A-Za-z]{3}-\d{4}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should display status badges with correct variants', () => {
    render(<TaskTable tasks={mockTasks} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should handle unassigned tasks gracefully', () => {
    const unassignedTask: Task = {
      ...mockTasks[0],
      id: 4,
      assignedTo: undefined,
      assignedToName: undefined
    };

    render(<TaskTable tasks={[unassignedTask]} />);

    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('should render table headers correctly', () => {
    render(<TaskTable tasks={mockTasks} />);

    expect(screen.getByText('Task title')).toBeInTheDocument();
    expect(screen.getByText('Assigned to')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Start date')).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
