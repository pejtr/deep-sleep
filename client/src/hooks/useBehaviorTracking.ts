import { useEffect, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export interface BehaviorEvent {
  eventType: 'scroll' | 'timeOnPage' | 'exitIntent' | 'pageView' | 'click';
  scrollDepth?: number;
  timeOnPage?: number;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  pageUrl?: string;
  referrer?: string;
  timestamp?: number;
}

export function useBehaviorTracking() {
  const trackingRef = useRef({
    scrollDepth: 0,
    maxScrollDepth: 0,
    timeOnPageStart: Date.now(),
    hasTrackedExit: false,
    hasTrackedPageView: false,
    deviceType: getDeviceType(),
    utmParams: extractUTMParams(),
  });

  // ✅ Stabilize mutation reference via useRef — prevents infinite re-render loop
  const trackEventMutation = trpc.behavior.trackEvent.useMutation();
  const mutateRef = useRef(trackEventMutation.mutate);
  useEffect(() => {
    mutateRef.current = trackEventMutation.mutate;
  });

  // Track scroll depth
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollPercent > trackingRef.current.maxScrollDepth) {
      trackingRef.current.maxScrollDepth = scrollPercent;

      // Track at 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      if (milestones.includes(Math.round(scrollPercent))) {
        mutateRef.current({
          eventType: 'scroll',
          scrollDepth: Math.round(scrollPercent),
          deviceType: trackingRef.current.deviceType,
          utmSource: trackingRef.current.utmParams.source,
          utmMedium: trackingRef.current.utmParams.medium,
          utmCampaign: trackingRef.current.utmParams.campaign,
          pageUrl: window.location.href,
          referrer: document.referrer,
        });
      }
    }
  }, []); // ✅ No deps — uses stable mutateRef

  // Track exit intent
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !trackingRef.current.hasTrackedExit) {
      trackingRef.current.hasTrackedExit = true;
      const timeOnPage = Math.round((Date.now() - trackingRef.current.timeOnPageStart) / 1000);

      mutateRef.current({
        eventType: 'exitIntent',
        timeOnPage,
        deviceType: trackingRef.current.deviceType,
        utmSource: trackingRef.current.utmParams.source,
        utmMedium: trackingRef.current.utmParams.medium,
        utmCampaign: trackingRef.current.utmParams.campaign,
        pageUrl: window.location.href,
        referrer: document.referrer,
      });
    }
  }, []); // ✅ No deps — uses stable mutateRef

  // Track time on page (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const timeOnPage = Math.round((Date.now() - trackingRef.current.timeOnPageStart) / 1000);

      mutateRef.current({
        eventType: 'timeOnPage',
        timeOnPage,
        scrollDepth: Math.round(trackingRef.current.maxScrollDepth),
        deviceType: trackingRef.current.deviceType,
        utmSource: trackingRef.current.utmParams.source,
        utmMedium: trackingRef.current.utmParams.medium,
        utmCampaign: trackingRef.current.utmParams.campaign,
        pageUrl: window.location.href,
        referrer: document.referrer,
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []); // ✅ Empty deps — runs once on mount

  // Setup event listeners + track initial page view (runs once)
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // ✅ Guard: track pageView only once per mount
    if (!trackingRef.current.hasTrackedPageView) {
      trackingRef.current.hasTrackedPageView = true;
      mutateRef.current({
        eventType: 'pageView',
        deviceType: trackingRef.current.deviceType,
        utmSource: trackingRef.current.utmParams.source,
        utmMedium: trackingRef.current.utmParams.medium,
        utmCampaign: trackingRef.current.utmParams.campaign,
        pageUrl: window.location.href,
        referrer: document.referrer,
      });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleScroll, handleMouseLeave]); // ✅ handleScroll/Leave are now stable (no deps)

  return {
    maxScrollDepth: trackingRef.current.maxScrollDepth,
    deviceType: trackingRef.current.deviceType,
    utmParams: trackingRef.current.utmParams,
  };
}

// Utility functions
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function extractUTMParams() {
  if (typeof window === 'undefined') {
    return { source: '', medium: '', campaign: '', content: '', term: '' };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || '',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
    content: params.get('utm_content') || '',
    term: params.get('utm_term') || '',
  };
}

export function trackClick(elementName: string) {
  const trackingRef = { utmParams: extractUTMParams(), deviceType: getDeviceType() };

  return {
    eventType: 'click',
    elementName,
    deviceType: trackingRef.deviceType,
    utmSource: trackingRef.utmParams.source,
    utmMedium: trackingRef.utmParams.medium,
    utmCampaign: trackingRef.utmParams.campaign,
    pageUrl: window.location.href,
    referrer: document.referrer,
  };
}
