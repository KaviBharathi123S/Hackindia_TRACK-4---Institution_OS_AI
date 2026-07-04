// Single place to point the frontend at your FastAPI backend.
// Change these two lines if your backend runs on a different host/port.
export const API_BASE = 'http://localhost:8000'
export const WS_BASE = 'ws://localhost:8000'

export const DEPARTMENTS = {
  1: { code: 'CSE', name: 'Computer Science' },
  2: { code: 'ECE', name: 'Electronics' },
  3: { code: 'EEE', name: 'Electrical' },
  4: { code: 'MECH', name: 'Mechanical' },
  5: { code: 'IT', name: 'Information Technology' },
  6: { code: 'CIVIL', name: 'Civil' },
}
