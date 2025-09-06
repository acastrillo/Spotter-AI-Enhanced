// Editable workout table component for UI integration
'use client';

import React, { useState, useCallback } from 'react';
import { type WorkoutRow, type WorkoutAST } from './igParser';

interface EditableWorkoutTableProps {
  rows: WorkoutRow[];
  onRowsChange: (updatedRows: WorkoutRow[]) => void;
  ast?: WorkoutAST;
  className?: string;
}

interface EditableCellProps {
  value: string;
  onSave: (newValue: string) => void;
  type?: 'text' | 'number' | 'load' | 'movement';
  suggestions?: string[];
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  onSave, 
  type = 'text',
  suggestions = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSave = useCallback(() => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
    setShowSuggestions(false);
  }, [editValue, value, onSave]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
    setShowSuggestions(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(editValue.toLowerCase())
  );

  if (isEditing) {
    return (
      <div className="relative">
        <input
          type="text"
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            setShowSuggestions(suggestions.length > 0 && e.target.value.length > 0);
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 max-h-32 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg">
            {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
              <div
                key={index}
                className="px-2 py-1 text-sm cursor-pointer hover:bg-blue-100"
                onMouseDown={() => {
                  setEditValue(suggestion);
                  setTimeout(handleSave, 0);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 rounded min-h-[24px]"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || <span className="text-gray-400 italic">Click to edit</span>}
    </div>
  );
};

const WorkoutModeIndicator: React.FC<{ mode?: WorkoutAST['blocks'][0]['mode'] }> = ({ mode }) => {
  if (!mode) return null;

  const getBadgeColor = (kind: string) => {
    switch (kind) {
      case 'AMRAP': return 'bg-red-100 text-red-800';
      case 'E#MOM':
      case 'EMOM': return 'bg-blue-100 text-blue-800';
      case 'ForTime': return 'bg-green-100 text-green-800';
      case 'Complex': return 'bg-purple-100 text-purple-800';
      case 'Ladder': return 'bg-yellow-100 text-yellow-800';
      case 'FixedRounds': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`px-2 py-1 rounded ${getBadgeColor(mode.kind)}`}>
        {mode.kind}
      </span>
      {mode.windowSec && (
        <span className="text-gray-600">
          {Math.round(mode.windowSec / 60)}min window
        </span>
      )}
      {mode.rounds && (
        <span className="text-gray-600">
          {mode.rounds} rounds
        </span>
      )}
    </div>
  );
};

export const EditableWorkoutTable: React.FC<EditableWorkoutTableProps> = ({
  rows,
  onRowsChange,
  ast,
  className = ''
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Get suggestions for movement names from the glossary
  const movementSuggestions = [
    'Push-Up', 'Pull-Up', 'Squat', 'Deadlift', 'Burpee', 'Thruster',
    'Wall Ball', 'Box Jump', 'Kettlebell Swing', 'Devil Press',
    'Row', 'SkiErg', 'Bike', 'Run', 'Farmer Carry', 'Plank'
  ];

  const quantitySuggestions = [
    '10 reps', '15 reps', '20 reps', '25 reps', '30 reps',
    '30 sec', '45 sec', '60 sec', '90 sec',
    '100 m', '200 m', '400 m', '500 m', '800 m',
    '10 cal', '15 cal', '20 cal'
  ];

  const loadSuggestions = [
    '20 lb', '25 lb', '35 lb', '50 lb', '65 lb',
    '15 kg', '20 kg', '24 kg', '32 kg', '48 kg',
    '2x 50 lb DB', '2x 35 lb DB', '48 kg KB', '32 kg KB'
  ];

  const updateRow = useCallback((index: number, field: keyof WorkoutRow, value: string) => {
    const updatedRows = rows.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    );
    onRowsChange(updatedRows);
  }, [rows, onRowsChange]);

  const addRow = useCallback(() => {
    const lastRow = rows[rows.length - 1];
    const newRow: WorkoutRow = {
      block: lastRow?.block || 'Block 1',
      round: lastRow?.round || 1,
      movement: '',
      qty: '',
      load: undefined,
      notes: undefined
    };
    onRowsChange([...rows, newRow]);
  }, [rows, onRowsChange]);

  const removeRow = useCallback((index: number) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    onRowsChange(updatedRows);
  }, [rows, onRowsChange]);

  const duplicateRow = useCallback((index: number) => {
    const rowToDuplicate = rows[index];
    const newRow = { ...rowToDuplicate, round: rowToDuplicate.round + 1 };
    const updatedRows = [...rows.slice(0, index + 1), newRow, ...rows.slice(index + 1)];
    onRowsChange(updatedRows);
  }, [rows, onRowsChange]);

  // Group rows by block for better organization
  const rowsByBlock = rows.reduce((groups, row, index) => {
    const blockName = row.block;
    if (!groups[blockName]) {
      groups[blockName] = [];
    }
    groups[blockName].push({ ...row, originalIndex: index });
    return groups;
  }, {} as Record<string, Array<WorkoutRow & { originalIndex: number }>>);

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Header with workout info */}
      {ast && (
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {ast.title || 'Parsed Workout'}
            </h3>
            <div className="flex items-center gap-4">
              {ast.scoring && (
                <span className="text-sm text-gray-600">
                  Scoring: <span className="font-medium">{ast.scoring}</span>
                </span>
              )}
              {ast.capSec && (
                <span className="text-sm text-gray-600">
                  Cap: <span className="font-medium">{Math.round(ast.capSec / 60)}min</span>
                </span>
              )}
              {ast.confidence && (
                <span className="text-sm text-gray-600">
                  Confidence: <span className="font-medium">{Math.round(ast.confidence * 100)}%</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Block
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Round
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Movement
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Load
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(rowsByBlock).map(([blockName, blockRows]) => (
              <React.Fragment key={blockName}>
                {/* Block header */}
                <tr className="bg-blue-50">
                  <td colSpan={7} className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{blockName}</span>
                      {ast?.blocks.find(b => (b.title || `Block ${ast.blocks.indexOf(b) + 1}`) === blockName)?.mode && (
                        <WorkoutModeIndicator 
                          mode={ast.blocks.find(b => (b.title || `Block ${ast.blocks.indexOf(b) + 1}`) === blockName)?.mode} 
                        />
                      )}
                    </div>
                  </td>
                </tr>
                
                {/* Block rows */}
                {blockRows.map((row) => (
                  <tr 
                    key={row.originalIndex}
                    className={`hover:bg-gray-50 ${selectedRows.has(row.originalIndex) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {row.block}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      <EditableCell
                        value={row.round.toString()}
                        onSave={(value) => updateRow(row.originalIndex, 'round', value)}
                        type="number"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <EditableCell
                        value={row.movement}
                        onSave={(value) => updateRow(row.originalIndex, 'movement', value)}
                        type="movement"
                        suggestions={movementSuggestions}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <EditableCell
                        value={row.qty}
                        onSave={(value) => updateRow(row.originalIndex, 'qty', value)}
                        suggestions={quantitySuggestions}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <EditableCell
                        value={row.load || ''}
                        onSave={(value) => updateRow(row.originalIndex, 'load', value || undefined)}
                        type="load"
                        suggestions={loadSuggestions}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <EditableCell
                        value={row.notes || ''}
                        onSave={(value) => updateRow(row.originalIndex, 'notes', value || undefined)}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateRow(row.originalIndex)}
                          className="text-blue-600 hover:text-blue-900 px-1 py-1 rounded"
                          title="Duplicate row"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => removeRow(row.originalIndex)}
                          className="text-red-600 hover:text-red-900 px-1 py-1 rounded"
                          title="Delete row"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with actions */}
      <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {rows.length} movements across {Object.keys(rowsByBlock).length} blocks
        </div>
        <div className="flex gap-2">
          <button
            onClick={addRow}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Movement
          </button>
        </div>
      </div>

      {/* Workout summary */}
      {ast && (
        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600">
          {ast.blocks.map((block, i) => (
            <div key={i} className="flex items-center gap-4">
              <span>{block.title || `Block ${i + 1}`}</span>
              {block.mode && (
                <span>{block.mode.kind} {block.mode.rounds ? `${block.mode.rounds}x` : ''}</span>
              )}
              {block.sequence.length > 0 && (
                <span>{block.sequence.length} movements</span>
              )}
            </div>
          )).slice(0, 3)}
          {ast.blocks.length > 3 && <div>...and {ast.blocks.length - 3} more blocks</div>}
        </div>
      )}
    </div>
  );
};

export default EditableWorkoutTable;