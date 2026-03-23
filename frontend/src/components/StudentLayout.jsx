import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentNavbar from './StudentNavbar';

export default function StudentLayout() {
  return (
    <div className="min-h-screen flex flex-col font-merriweather bg-slate-50">
      <StudentNavbar />
      <div className="flex-1 w-full flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
