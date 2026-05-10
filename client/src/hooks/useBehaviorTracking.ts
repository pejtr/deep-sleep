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
    deviceType: getDeviceType(),
    utmParams: extractUTMParams(),
  });

  const trackEventMutation = trpc.behavior.trackEvent.useMutation();

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
        trackEventMutation.mutate({
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
  }, [trackEventMutation]);

  // Track exit intent
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !trackingRef.current.hasTrackedExit) {
      trackingRef.current.hasTrackedExit = true;
      const timeOnPage = Math.round((Date.now() - trackingRef.current.timeOnPageStart) / 1000);

      trackEventMutation.mutate({
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
  }, [trackEventMutation]);

  // Track time on page (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const timeOnPage = Math.round((Date.now() - trackingRef.current.timeOnPageStart) / 1000);

      trackEventMutation.mutate({
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
    }, 30000); // Track every 30 seconds

    return () => clearInterval(interval);
  }, [trackEventMutation]);

  // Setup event listeners
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Track initial page view
    trackEventMutation.mutate({
      eventType: 'pageView',
      deviceType: trackingRef.current.deviceType,
      utmSource: trackingRef.current.utmParams.source,
      utmMedium: trackingRef.current.utmParams.medium,
      utmCampaign: trackingRef.current.utmParams.campaign,
      pageUrl: window.location.href,
      referrer: document.referrer,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleScroll, handleMouseLeave, trackEventMutation]);

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

  // This would be called via trpc.behavior.trackEvent mutation
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
