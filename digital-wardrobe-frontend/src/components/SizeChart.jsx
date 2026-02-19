const sizeChartRows = {
  tops: [
    { size: "XS", bust: '31-33"', waist: '24-26"' },
    { size: "S", bust: '33-35"', waist: '26-28"' },
    { size: "M", bust: '35-37"', waist: '28-30"' },
    { size: "L", bust: '37-40"', waist: '30-33"' },
    { size: "XL", bust: '40-43"', waist: '33-36"' },
  ],
  dresses: [
    { size: "XS", bust: '31-33"', waist: '24-26"', hips: '34-36"' },
    { size: "S", bust: '33-35"', waist: '26-28"', hips: '36-38"' },
    { size: "M", bust: '35-37"', waist: '28-30"', hips: '38-40"' },
    { size: "L", bust: '37-40"', waist: '30-33"', hips: '40-43"' },
    { size: "XL", bust: '40-43"', waist: '33-36"', hips: '43-46"' },
  ],
  bottoms: [
    { size: "XS", waist: '24-26"', hips: '34-36"', inseam: '29-30"' },
    { size: "S", waist: '26-28"', hips: '36-38"', inseam: '29-30"' },
    { size: "M", waist: '28-30"', hips: '38-40"', inseam: '30-31"' },
    { size: "L", waist: '30-33"', hips: '40-43"', inseam: '30-31"' },
    { size: "XL", waist: '33-36"', hips: '43-46"', inseam: '31-32"' },
  ],
  shoes: [
    { size: "5", footLength: "8.66 in", eu: "35-36" },
    { size: "6", footLength: "9.06 in", eu: "36-37" },
    { size: "7", footLength: "9.25 in", eu: "37-38" },
    { size: "8", footLength: "9.45 in", eu: "38-39" },
    { size: "9", footLength: "9.84 in", eu: "39-40" },
    { size: "10", footLength: "10.04 in", eu: "40-41" },
  ],
};

function SimpleTable({ title, headers, rows, columns }) {
  return (
    <div className="rounded-xl border border-cocoa/15 bg-latte/70 overflow-hidden">
      <div className="px-4 py-3 border-b border-cocoa/10">
        <h3 className="text-cocoa font-medium">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-beige/80 text-cocoa/80">
              {headers.map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${title}-${row.size}`} className="border-t border-cocoa/10 text-cocoa">
                {columns.map((column) => (
                  <td key={`${row.size}-${column}`} className="px-3 py-2">
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SizeChart({ id = "size-chart", compact = false }) {
  return (
    <section id={id} className={`bg-beige rounded-2xl shadow-sm ${compact ? "p-4" : "p-6 md:p-8"}`}>
      <h2 className={`${compact ? "text-xl" : "text-2xl"} font-serif text-cocoa`}>Size Chart</h2>
      <p className="text-cocoa/75 text-sm mt-1 mb-4">
        General guide in inches. Fit may vary slightly by product.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SimpleTable
          title="Tops"
          headers={["Size", "Bust", "Waist"]}
          rows={sizeChartRows.tops}
          columns={["size", "bust", "waist"]}
        />
        <SimpleTable
          title="Dresses"
          headers={["Size", "Bust", "Waist", "Hips"]}
          rows={sizeChartRows.dresses}
          columns={["size", "bust", "waist", "hips"]}
        />
        <SimpleTable
          title="Bottoms"
          headers={["Size", "Waist", "Hips", "Inseam"]}
          rows={sizeChartRows.bottoms}
          columns={["size", "waist", "hips", "inseam"]}
        />
        <SimpleTable
          title="Shoes"
          headers={["Size", "Foot Length", "EU"]}
          rows={sizeChartRows.shoes}
          columns={["size", "footLength", "eu"]}
        />
      </div>
    </section>
  );
}
