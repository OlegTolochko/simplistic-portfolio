import type { TokenTableProps } from "./token-types";

export default function TokenTable({ columns, rows, caption }: TokenTableProps) {
  return (
    <figure className="my-10">
      <div className="overflow-x-auto rounded-[1.75rem] border border-sand-300 bg-sand-50 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm text-sand-900">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="border-b border-sand-300 bg-sand-100 px-4 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`cell-${rowIndex}-${cellIndex}`} className="border-b border-sand-200 px-4 py-3 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <figcaption className="mt-3 text-sm leading-6 text-sand-600">{caption}</figcaption> : null}
    </figure>
  );
}
