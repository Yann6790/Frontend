import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherNavbar from './TeacherNavbar';

export default function TeacherLayout() {
  return (
    <div className="min-h-screen flex flex-col font-merriweather bg-slate-50">
      <TeacherNavbar />
      <div className="flex-1 w-full flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
