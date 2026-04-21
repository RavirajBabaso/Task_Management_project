import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskFilters } from '../types/task.types';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  loading: boolean;
}

const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  filters: {},
  loading: false
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.loading = false;
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    }
  }
});

export const { setTasks, setSelectedTask, setFilters } = taskSlice.actions;
export default taskSlice.reducer;
