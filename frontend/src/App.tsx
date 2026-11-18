import { QueryClientProvider } from '@tanstack/react-query';

import { Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { ToastProvider } from '@/components/ui';
import { queryClient } from '@/lib/queryClient';
import { AntrianProduksi } from '@/pages/AntrianProduksi';
import { Arsip } from '@/pages/Arsip';
import { DaftarPesanan } from '@/pages/DaftarPesanan';
import { Dashboard } from '@/pages/Dashboard';
import { DetailPesanan } from '@/pages/DetailPesanan';
import { EditPesanan } from '@/pages/EditPesanan';
import { InvoicePesanan } from '@/pages/InvoicePesanan';
import { MasterCustomer } from '@/pages/MasterCustomer';
import { MasterKain } from '@/pages/MasterKain';
import { NotFound } from '@/pages/NotFound';
import { PesananBaru } from '@/pages/PesananBaru';
import { PreviewSpk } from '@/pages/PreviewSpk';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pesanan/baru" element={<PesananBaru />} />
            <Route path="/pesanan" element={<DaftarPesanan />} />
            <Route path="/pesanan/:id" element={<DetailPesanan />} />
            <Route path="/pesanan/:id/edit" element={<EditPesanan />} />
            <Route path="/pesanan/:id/invoice" element={<InvoicePesanan />} />
            <Route path="/pesanan/:id/spk/:spk_id" element={<PreviewSpk />} />
            <Route path="/antrian" element={<AntrianProduksi />} />
            <Route path="/arsip" element={<Arsip />} />
            <Route path="/master/kain" element={<MasterKain />} />
            <Route path="/master/customer" element={<MasterCustomer />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </QueryClientProvider>
  );
}