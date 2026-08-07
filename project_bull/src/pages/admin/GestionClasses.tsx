import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ClassesContent } from './ClassesContent';

export const GestionClasses: React.FC = () => {
  return (
    <AdminLayout>
      <ClassesContent />
    </AdminLayout>
  );
};
