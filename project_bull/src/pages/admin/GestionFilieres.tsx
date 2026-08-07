import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { FilieresContent } from './FilieresContent';

export const GestionFilieres: React.FC = () => {
  return (
    <AdminLayout>
      <FilieresContent />
    </AdminLayout>
  );
};
