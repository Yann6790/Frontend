import React from 'react';
import { Link } from 'react-router-dom';
import SharedGallery from '../components/SharedGallery';

export default function StudentGalleryPage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      {/* Main Content Area: Shared Gallery */}
      <div className="flex-1 w-full flex flex-col items-center">
        <SharedGallery />
      </div>
    </div>
  );
}
