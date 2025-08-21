
import { Student } from "@/types";
import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface StudentCodeDisplayProps {
  student: Student;
}

export default function StudentCodeDisplay({ student }: StudentCodeDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, student.code, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 20,
        font: "Cairo",
        textMargin: 10
      });
    }
  }, [student.code]);

  return (
    <div className="flex flex-col items-center w-full bg-white p-6 rounded-2xl">
      <h2 className="text-xl font-bold text-physics-navy mb-2">{student.name}</h2>
      <div className="bg-white p-4 mb-4 w-full">
        <svg ref={barcodeRef} className="w-full"></svg>
      </div>
      <div className="text-physics-navy text-2xl font-bold">{student.code}</div>
    </div>
  );
}
