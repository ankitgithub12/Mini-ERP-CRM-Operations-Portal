import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challanService } from '../../services/challanService';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getErrorMessage } from '../../utils/helpers';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Building, Phone, Mail, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ChallanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null); // 'confirm' or 'cancel'
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchChallan(); }, [id]);

  const fetchChallan = async () => {
    try {
      const res = await challanService.getById(id);
      setChallan(res.data.data);
    } catch (err) {
      toast.error('Challan not found');
      navigate('/challans');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    setProcessing(true);
    try {
      if (confirmAction === 'confirm') {
        await challanService.confirm(id);
        toast.success('Challan confirmed! Stock has been deducted.');
      } else {
        await challanService.cancel(id);
        toast.success('Challan cancelled');
      }
      setConfirmAction(null);
      fetchChallan();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = [79, 70, 229]; // Indigo (#4F46E5)
      const textColor = [55, 65, 81];
      const lightGray = [243, 244, 246];

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;

      // Header Block
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('DELIVERY CHALLAN', margin, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Operations Portal - Mini ERP + CRM', margin, 25);
      doc.text('Phone: +91 9876543210 | Email: billing@company.com', margin, 30);

      // Reset text color for body
      doc.setTextColor(...textColor);

      // Section: Challan Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('CHALLAN DETAILS', pageWidth - margin - 60, 52);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      let detailY = 58;
      const drawDetailRow = (label, val) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, pageWidth - margin - 60, detailY);
        doc.setFont('helvetica', 'normal');
        doc.text(val, pageWidth - margin - 32, detailY);
        detailY += 6;
      };
      
      drawDetailRow('Challan No:', challan.challan_number || 'N/A');
      drawDetailRow('Date:', formatDate(challan.created_at) || 'N/A');
      drawDetailRow('Status:', challan.status || 'N/A');
      drawDetailRow('Created By:', challan.users?.name || 'N/A');

      // Section: Bill To / Customer Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('BILL TO (CUSTOMER)', margin, 52);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      let custY = 58;
      const drawCustomerRow = (val) => {
        if (!val) return;
        doc.text(val, margin, custY);
        custY += 6;
      };

      drawCustomerRow(customer?.customer_name);
      if (customer?.business_name) drawCustomerRow(`Business: ${customer.business_name}`);
      if (customer?.gst_number) drawCustomerRow(`GSTIN: ${customer.gst_number}`);
      if (customer?.mobile) drawCustomerRow(`Mobile: ${customer.mobile}`);
      if (customer?.email) drawCustomerRow(`Email: ${customer.email}`);

      // Address (wrapped)
      if (customer?.address) {
        doc.setFont('helvetica', 'bold');
        doc.text('Address:', margin, custY);
        doc.setFont('helvetica', 'normal');
        const splitAddress = doc.splitTextToSize(customer.address, 80);
        doc.text(splitAddress, margin + 16, custY);
        custY += splitAddress.length * 5;
      }

      // Starting Y position for table is whichever section is taller
      const startY = Math.max(detailY, custY) + 10;

      // Table Items (Format prices as INR since standard fonts don't support Indian Rupee symbol)
      const formatPDFCurrency = (amt) => `INR ${(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      const tableHeaders = [['#', 'Product Name', 'SKU', 'Unit Price', 'Qty', 'Total Price']];
      const tableData = (challan.items || []).map((item, index) => [
        index + 1,
        item.product_name,
        item.sku,
        formatPDFCurrency(item.unit_price),
        item.quantity,
        formatPDFCurrency(item.total_price)
      ]);

      doc.autoTable({
        startY: startY,
        head: tableHeaders,
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          textColor: textColor,
          fontSize: 8.5,
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 70 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 15 },
          5: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: margin, right: margin }
      });

      // Totals section
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFillColor(...lightGray);
      doc.rect(pageWidth - margin - 80, finalY, 80, 24, 'F');

      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Total Quantity:', pageWidth - margin - 75, finalY + 8);
      doc.text(String(challan.total_quantity), pageWidth - margin - 20, finalY + 8, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.text('Grand Total:', pageWidth - margin - 75, finalY + 16);
      doc.text(formatPDFCurrency(challan.total_amount), pageWidth - margin - 20, finalY + 16, { align: 'right' });

      // Terms & Signature
      const footerY = finalY + 40;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Terms & Conditions:', margin, footerY);
      doc.text('1. Goods once sold will not be taken back.', margin, footerY + 5);
      doc.text('2. Subject to local jurisdiction.', margin, footerY + 10);

      // Signature line
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text('For Operations Portal', pageWidth - margin - 50, footerY);
      doc.line(pageWidth - margin - 50, footerY + 15, pageWidth - margin, footerY + 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Authorized Signatory', pageWidth - margin - 42, footerY + 20);

      // Save document
      doc.save(`Challan_${challan.challan_number}.pdf`);
      toast.success('Challan exported as PDF');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!challan) return null;

  const customer = challan.customers;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{challan.challan_number}</h1>
              <span className={`badge ${getStatusColor(challan.status)}`}>{challan.status}</span>
            </div>
            <p className="page-subtitle">Created on {formatDateTime(challan.created_at)} by {challan.users?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} className="btn-secondary btn-sm flex items-center gap-1.5 shadow-sm">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          {challan.status === 'DRAFT' && (
            <>
              {hasPermission('challans', 'confirm') && (
                <button onClick={() => setConfirmAction('confirm')} className="btn-success btn-sm">
                  <CheckCircle className="w-4 h-4" /> Confirm
                </button>
              )}
              <button onClick={() => setConfirmAction('cancel')} className="btn-danger btn-sm">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="card">
        <div className="card-header"><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer</h3></div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{customer?.customer_name}</p>
                <p className="text-xs text-gray-500">{customer?.business_name}</p>
              </div>
            </div>
            {customer?.mobile && (
              <div className="flex items-start gap-3"><Phone className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm">{customer.mobile}</p></div>
            )}
            {customer?.email && (
              <div className="flex items-start gap-3"><Mail className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm">{customer.email}</p></div>
            )}
            {customer?.gst_number && (
              <div className="flex items-start gap-3"><FileText className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm">GST: {customer.gst_number}</p></div>
            )}
            {customer?.address && (
              <div className="flex items-start gap-3 sm:col-span-2"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm">{customer.address}</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card">
        <div className="card-header"><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Items</h3></div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-gray-400">{index + 1}</td>
                  <td className="font-medium text-gray-900">{item.product_name}</td>
                  <td><span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{item.sku}</span></td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td className="font-medium">{item.quantity}</td>
                  <td className="text-right font-medium">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end gap-12">
            <div>
              <p className="text-xs text-gray-500">Total Quantity</p>
              <p className="text-lg font-bold text-gray-900">{challan.total_quantity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-lg font-bold text-primary-600">{formatCurrency(challan.total_amount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm/Cancel Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction === 'confirm' ? 'Confirm Challan' : 'Cancel Challan'}
        message={
          confirmAction === 'confirm'
            ? 'This will deduct stock for all items. This action cannot be undone. Are you sure?'
            : 'This will cancel the challan. Are you sure?'
        }
        confirmText={processing ? 'Processing...' : confirmAction === 'confirm' ? 'Confirm Challan' : 'Cancel Challan'}
        variant={confirmAction === 'confirm' ? 'primary' : 'danger'}
      />
    </div>
  );
};

export default ChallanDetail;
