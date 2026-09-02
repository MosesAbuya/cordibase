"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, X } from 'lucide-react';

type ModalType = 'alert' | 'confirm' | 'prompt' | null;

interface ModalOptions {
  title?: string;
  message: string;
  defaultValue?: string;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
}

interface ModalContextType {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
  prompt: (message: string, title?: string, defaultValue?: string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    type: ModalType;
    options: ModalOptions;
  } | null>(null);

  const [inputValue, setInputValue] = useState("");

  const alert = useCallback((message: string, title?: string) => {
    return new Promise<void>((resolve) => {
      setModalState({
        type: 'alert',
        options: {
          title,
          message,
          onConfirm: () => resolve(),
          onCancel: () => resolve()
        }
      });
    });
  }, []);

  const confirm = useCallback((message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        type: 'confirm',
        options: {
          title,
          message,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        }
      });
    });
  }, []);

  const prompt = useCallback((message: string, title?: string, defaultValue?: string) => {
    return new Promise<string | null>((resolve) => {
      setInputValue(defaultValue || "");
      setModalState({
        type: 'prompt',
        options: {
          title,
          message,
          defaultValue,
          onConfirm: (val) => resolve(val || ""),
          onCancel: () => resolve(null)
        }
      });
    });
  }, []);

  const handleClose = () => {
    if (modalState?.options.onCancel) {
      modalState.options.onCancel();
    }
    setModalState(null);
  };

  const handleConfirm = () => {
    if (modalState?.options.onConfirm) {
      modalState.options.onConfirm(modalState.type === 'prompt' ? inputValue : undefined);
    }
    setModalState(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleConfirm();
  };

  return (
    <ModalContext.Provider value={{ alert, confirm, prompt }}>
      {children}
      
      {modalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2939]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-[#F9FAFB]">
              <div className="flex items-center gap-3">
                {modalState.type === 'alert' && <AlertCircle className="w-5 h-5 text-thread" />}
                {modalState.type === 'confirm' && <HelpCircle className="w-5 h-5 text-[#344054]" />}
                {modalState.type === 'prompt' && <CheckCircle2 className="w-5 h-5 text-[#344054]" />}
                <h3 className="font-semibold text-ink">
                  {modalState.options.title || (modalState.type === 'alert' ? 'Alert' : modalState.type === 'confirm' ? 'Confirm Action' : 'Input Required')}
                </h3>
              </div>
              <button onClick={handleClose} className="text-ink/60 hover:text-ink focus:outline-none p-1 rounded-md hover:bg-[#EAECF0] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <p className="text-sm text-[#344054]">{modalState.options.message}</p>
              
              {modalState.type === 'prompt' && (
                <div>
                  <input 
                    autoFocus
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" 
                  />
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-3 border-t border-ink/10">
                {modalState.type !== 'alert' && (
                  <button 
                    type="button" 
                    onClick={handleClose} 
                    className="px-4 py-2 text-sm font-medium text-[#344054] hover:bg-linen border border-ink/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-thread hover:bg-[#8B3125] rounded-lg transition-colors shadow-sm"
                >
                  OK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
