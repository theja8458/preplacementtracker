"use client";

import React, { Component, ErrorInfo } from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  eventId: string | null;
}

/**
 * ErrorBoundary
 *
 * App-level React error boundary.
 * • Catches any uncaught render error in the subtree.
 * • Reports it to Sentry (purely additive — invisible to the student).
 * • Shows a friendly "Something went wrong, please refresh" screen
 *   instead of a blank white page.
 *
 * Place this at the root layout level so every page is covered.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, eventId: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    });
    this.setState({ eventId: eventId ?? null });
  }

  handleRefresh = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #0b0d1a 0%, #0f1120 50%, #0a0c18 100%)" }}
      >
        <div className="text-center max-w-md">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1
            className="text-2xl font-black text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Something went wrong
          </h1>

          {/* Message */}
          <p className="text-[#64748B] text-sm mb-7 leading-relaxed">
            An unexpected error occurred. Our team has been notified automatically.
            Refreshing the page usually fixes this.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRefresh}
              className="px-6 py-3 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-violet-500/25 transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.history.back();
              }}
              className="px-6 py-3 rounded-2xl text-sm text-[#94A3B8] hover:text-white transition hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Go Back
            </button>
          </div>

          {/* Event ID for support */}
          {this.state.eventId && (
            <p className="mt-6 text-[10px] text-[#334155] font-mono">
              Error ID: {this.state.eventId}
            </p>
          )}
        </div>
      </div>
    );
  }
}
