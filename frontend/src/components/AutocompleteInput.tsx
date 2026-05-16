import React, { useState, useEffect, useRef } from 'react';
import { colors, shadows, radius } from '../styles';
import api from '../services/api';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  endpoint: string;
  placeholder: string;
  disabled?: boolean;
}

const AutocompleteInput = ({ value, onChange, endpoint, placeholder, disabled }: AutocompleteInputProps) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/${endpoint}/search?q=${query}`);
        setResults(res.data);
        setShowDropdown(res.data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [query, endpoint]);

  const handleSelect = (name: string) => {
    setQuery(name);
    onChange(name);
    setShowDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' as 'relative', width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: `2px solid ${showDropdown ? colors.primary : colors.border}`,
        borderRadius: radius.md, backgroundColor: disabled ? '#F8F8F8' : '#FAFBFF',
        transition: 'border-color 0.2s',
      }}>
        <input
          style={{
            flex: 1, padding: '11px 14px', border: 'none', outline: 'none',
            fontSize: '15px', backgroundColor: 'transparent',
            fontFamily: 'inherit', color: colors.textPrimary,
          }}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          disabled={disabled}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
        />
        {isSearching && (
          <span style={{ padding: '0 12px', color: colors.textMuted, fontSize: '12px' }}>⏳</span>
        )}
        {query && !disabled && (
          <button
            style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, fontSize: '14px' }}
            onClick={() => { setQuery(''); onChange(''); setShowDropdown(false); }}
          >✕</button>
        )}
      </div>

      {showDropdown && (
        <div style={{
          position: 'absolute' as 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          backgroundColor: colors.surface, borderRadius: radius.md,
          boxShadow: shadows.xl, border: `1px solid ${colors.border}`,
          zIndex: 500, overflow: 'hidden', maxHeight: '240px', overflowY: 'auto' as 'auto',
        }}>
          {results.map((result, index) => (
            <div
              key={result.id}
              style={{
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: index < results.length - 1 ? `1px solid ${colors.border}` : 'none',
                transition: 'background 0.15s',
                backgroundColor: 'white',
              }}
              onClick={() => handleSelect(result.name)}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.background)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <p style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '600', color: colors.primary }}>
                {result.name}
                {!result.isVerified && (
                  <span style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '400', marginLeft: '8px' }}>
                    (non vérifié)
                  </span>
                )}
              </p>
              {result.city && (
                <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>
                  📍 {result.city}
                  {result.type && ` · ${result.type.replace('_', ' ')}`}
                  {result.sector && ` · ${result.sector}`}
                </p>
              )}
            </div>
          ))}
          {query.length >= 2 && results.length === 0 && !isSearching && (
            <div style={{ padding: '12px 16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted, fontStyle: 'italic' }}>
                "{query}" sera ajouté comme nouvelle entrée
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;