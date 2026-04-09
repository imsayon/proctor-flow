// src/components/seats/SeatGrid.jsx
// Advanced 30×20 seat grid editor with ACTIVE/VOID toggle, drag select, bulk ops
import { useState, useCallback, useRef } from 'react';

const MAX_ROWS = 30, MAX_COLS = 20;

function createGrid(rows, cols, existingGrid) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (existingGrid?.[r]?.[c]) return existingGrid[r][c];
      return { row: r, col: c, state: 'ACTIVE' };
    })
  );
}

export default function SeatGrid({ grid, rows, cols, onChange, readOnly = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'VOID' or 'ACTIVE'
  const gridRef = useRef(null);

  const activeCount = grid.flat().filter(c => c.state === 'ACTIVE').length;

  const toggle = useCallback((r, c, forceState) => {
    if (readOnly) return;
    const next = grid.map(row => row.map(cell => {
      if (cell.row === r && cell.col === c) {
        return { ...cell, state: forceState || (cell.state === 'ACTIVE' ? 'VOID' : 'ACTIVE') };
      }
      return cell;
    }));
    onChange(next);
  }, [grid, onChange, readOnly]);

  const handleMouseDown = (r, c) => {
    if (readOnly) return;
    const newState = grid[r][c].state === 'ACTIVE' ? 'VOID' : 'ACTIVE';
    setIsDragging(true);
    setDragMode(newState);
    toggle(r, c, newState);
  };

  const handleMouseEnter = (r, c) => {
    if (!isDragging || readOnly) return;
    toggle(r, c, dragMode);
  };

  const handleMouseUp = () => setIsDragging(false);

  const voidRow = (rowIdx) => {
    const next = grid.map((row, ri) => row.map(cell => ri === rowIdx ? { ...cell, state: 'VOID' } : cell));
    onChange(next);
  };

  const voidCol = (colIdx) => {
    const next = grid.map(row => row.map(cell => cell.col === colIdx ? { ...cell, state: 'VOID' } : cell));
    onChange(next);
  };

  const voidAisle = (every = 4) => {
    const next = grid.map(row => row.map(cell => (cell.col + 1) % every === 0 ? { ...cell, state: 'VOID' } : cell));
    onChange(next);
  };

  const activateAll = () => {
    const next = grid.map(row => row.map(cell => ({ ...cell, state: 'ACTIVE' })));
    onChange(next);
  };

  const cellSize = rows > 15 || cols > 12 ? 'w-6 h-5' : 'w-9 h-7';
  const fontSize = rows > 15 || cols > 12 ? 'text-[6px]' : 'text-[8px]';

  return (
    <div>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={activateAll} className="btn btn-outline text-[10px] !py-1 !px-2">✓ All Active</button>
          <button onClick={() => voidAisle(4)} className="btn btn-outline text-[10px] !py-1 !px-2">Void Aisle (every 4th)</button>
          <button onClick={() => voidAisle(5)} className="btn btn-outline text-[10px] !py-1 !px-2">Void Aisle (every 5th)</button>
          <span className="ml-auto font-mono text-[10px] text-[#7d8590] self-center">
            {activeCount} active / {rows * cols} total · Click or drag to toggle
          </span>
        </div>
      )}

      {/* Grid */}
      <div className="overflow-auto border border-[#30363d] bg-[#0d1117] p-2" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} ref={gridRef}>
        {/* Column headers */}
        <div className="flex gap-[2px] mb-[2px] ml-5">
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className={`${cellSize} flex items-center justify-center font-mono ${fontSize} text-[#484f58] cursor-pointer hover:text-[#f85149]`}
              onClick={() => !readOnly && voidCol(c)}
              title={`Click to void column ${c + 1}`}>
              {c + 1}
            </div>
          ))}
        </div>

        {grid.map((row, ri) => (
          <div key={ri} className="flex gap-[2px] mb-[2px]">
            {/* Row label */}
            <div className={`w-5 flex items-center justify-center font-mono ${fontSize} text-[#484f58] cursor-pointer hover:text-[#f85149] flex-shrink-0`}
              onClick={() => !readOnly && voidRow(ri)}
              title={`Click to void row ${ri + 1}`}>
              {ri + 1}
            </div>
            {row.map((cell, ci) => {
              const isVoid = cell.state === 'VOID';
              return (
                <div
                  key={ci}
                  onMouseDown={() => handleMouseDown(ri, ci)}
                  onMouseEnter={() => handleMouseEnter(ri, ci)}
                  className={`${cellSize} flex items-center justify-center border transition-all duration-100 select-none flex-shrink-0
                    ${isVoid
                      ? 'border-dashed border-[#30363d]/40 bg-[#0d1117] cursor-pointer'
                      : 'border-[#30363d] bg-[#1c2128] cursor-pointer hover:bg-[#f0a500]/20 hover:border-[#f0a500]/50'
                    } ${readOnly ? 'cursor-default' : ''}`}
                  title={`${ri + 1},${ci + 1}: ${cell.state}`}
                >
                  {!isVoid && (
                    <span className={`font-mono ${fontSize} text-[#7d8590]`}>
                      {String(ri * cols + ci + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 font-mono text-[9px] text-[#7d8590]">
        <span className="flex items-center gap-1"><span className="w-3 h-2.5 bg-[#1c2128] border border-[#30363d] inline-block" /> Active</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2.5 bg-[#0d1117] border border-dashed border-[#30363d]/40 inline-block" /> Void</span>
        {!readOnly && <span>· Click row/col headers to void entire row/column</span>}
      </div>
    </div>
  );
}

export { createGrid, MAX_ROWS, MAX_COLS };
