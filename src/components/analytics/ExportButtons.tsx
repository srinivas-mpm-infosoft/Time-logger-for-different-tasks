"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";

function downloadCSV(filename: string, rows: string) {
  const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(data: any) {
  const lines: string[] = [];
  lines.push(["Date", "TotalSeconds", "Sessions"].join(","));
  (data.timeseries || []).forEach((r: any) => {
    lines.push([r.date, r.totalSeconds || 0, r.sessions || 0].join(","));
  });

  lines.push("");
  lines.push(["Task", "TotalSeconds"].join(","));
  (data.byTask || []).forEach((t: any) => {
    // escape quotes
    const title = (t.title || "").replace(/"/g, '""');
    lines.push([`"${title}"`, t.totalSeconds || 0].join(","));
  });

  return lines.join("\n");
}

export default function ExportButtons({ data, start, end, rootRef }: { data: any; start: string; end: string; rootRef: React.RefObject<HTMLDivElement> }) {
  const handleCSV = (e: React.MouseEvent) => {
    e.preventDefault();
    const csv = toCSV(data);
    downloadCSV(`analytics_${start}_to_${end}.csv`, csv);
  };

  const handlePDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!rootRef?.current) return;
    const element = rootRef.current;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = (pdf as any).getImageProperties(imgData);
      const imgWidth = pageWidth - 40;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.text(`Analytics (${start} → ${end})`, 20, 30);
      pdf.addImage(imgData, "PNG", 20, 50, imgWidth, imgHeight);
      pdf.save(`analytics_${start}_to_${end}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleCSV} className="btn">Export CSV</button>
      <button onClick={handlePDF} className="btn">Export PDF</button>
    </div>
  );
}
