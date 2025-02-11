import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Space, Divider } from 'antd';

const { Title, Text } = Typography;

const CoreWebVitalsMonitor = () => {
  const [metrics, setMetrics] = useState({
    LCP: null,
    FID: null,
    CLS: null
  });
  const [showLargeContent, setShowLargeContent] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [currentCLS, setCurrentCLS] = useState(0);

  useEffect(() => {
    const getRating = (name, value) => {
      const thresholds = {
        LCP: { good: 2500, needsImprovement: 4000 },
        FID: { good: 100, needsImprovement: 300 },
        CLS: { good: 0.1, needsImprovement: 0.25 }
      };

      const threshold = thresholds[name];
      if (value <= threshold.good) return 'good';
      if (value <= threshold.needsImprovement) return 'needs-improvement';
      return 'poor';
    };

    let sessionCLS = 0;
    let sessionEntries = [];
    
    const updateCLS = (entries) => {
      for (const entry of entries) {
        // Only count entries that occurred within 500ms of each other
        if (!entry.hadRecentInput) {
          const firstTimestamp = sessionEntries[0]?.startTime || entry.startTime;
          if (entry.startTime - firstTimestamp < 500) {
            sessionCLS += entry.value;
            sessionEntries.push(entry);
          } else {
            // Start new session
            sessionCLS = entry.value;
            sessionEntries = [entry];
          }
          
          setCurrentCLS(sessionCLS);
          setMetrics(prev => ({
            ...prev,
            CLS: { value: sessionCLS, rating: getRating('CLS', sessionCLS) }
          }));
        }
      }
    };

    const clsObserver = new PerformanceObserver((entryList) => {
      updateCLS(entryList.getEntries());
    });

    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        const value = lastEntry.renderTime || lastEntry.loadTime;
        setMetrics(prev => ({
          ...prev,
          LCP: { value, rating: getRating('LCP', value) }
        }));
      }
    });

    const fidObserver = new PerformanceObserver((entryList) => {
      const entry = entryList.getEntries()[0];
      const value = entry.processingStart - entry.startTime;
      setMetrics(prev => ({
        ...prev,
        FID: { value, rating: getRating('FID', value) }
      }));
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.error('Performance measurement not supported:', e);
    }

    return () => {
      clsObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
    };
  }, []);

  const resetCLS = () => {
    // Reset metrics state for CLS
    setMetrics(prev => ({
      ...prev,
      CLS: { value: 0, rating: 'good' }
    }));
    setCurrentCLS(0);
  };

  const handleContentToggle = () => {
    resetCLS();
    setShowLargeContent(prev => !prev);
  };

  const handleBannerToggle = () => {
    resetCLS();
    setShowBanner(prev => !prev);
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good':
        return 'success';
      case 'needs-improvement':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatValue = (name, metric) => {
    if (!metric) return 'Loading...';
    
    if (name === 'CLS') {
      return metric.value.toFixed(3);
    }
    return `${Math.round(metric.value)}ms`;
  };

  const getMetricDescription = (name) => {
    const descriptions = {
      LCP: 'Largest Contentful Paint (loading)',
      FID: 'First Input Delay (interactivity)',
      CLS: 'Cumulative Layout Shift (visual stability)'
    };
    return descriptions[name];
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card 
        title={<Title level={4}>Core Web Vitals Monitor</Title>}
        style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {Object.entries(metrics).map(([name, metric]) => (
            <Card.Grid
              key={name}
              hoverable={false}
              style={{ width: '100%', padding: '16px' }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div>
                  <Text strong>{name}</Text>
                  <br />
                  <Text type="secondary">{getMetricDescription(name)}</Text>
                </div>
                <Tag color={metric ? getRatingColor(metric.rating) : 'default'}>
                  <Text style={{ fontFamily: 'monospace' }}>
                    {formatValue(name, metric)}
                  </Text>
                </Tag>
              </div>
            </Card.Grid>
          ))}
        </Space>
      </Card>

      <Card
        title={<Title level={4}>CLS Test Tools</Title>}
        extra={<Button onClick={resetCLS}>Reset CLS</Button>}
        style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Current CLS Value: </Text>
            <Tag color={
              currentCLS <= 0.1 ? 'success' : 
              currentCLS <= 0.25 ? 'warning' : 
              'error'
            }>
              {currentCLS.toFixed(3)}
            </Tag>
          </div>
          
          <Divider />

          <div>
            <Text strong>Test 1: Sudden Content Insertion</Text>
            <Button 
              onClick={handleContentToggle}
              style={{ marginLeft: 16 }}
            >
              Toggle Large Content
            </Button>
            <div style={{ minHeight: '200px', marginTop: 16 }}>
              {showLargeContent && (
                <div style={{ 
                  padding: '20px',
                  backgroundColor: '#f0f0f0',
                  marginBottom: '20px'
                }}>
                  <Text>
                    This is a large content block that appears suddenly and pushes other content down.
                    This should cause a layout shift that will be measured by CLS.
                  </Text>
                  <br />
                  <Text>Multiple lines of text to create more shift.</Text>
                  <br />
                  <Text>Even more content to maximize the layout shift.</Text>
                </div>
              )}
              <Text>Content below that gets pushed down</Text>
              <br />
              <Text>More content that will shift</Text>
              <br />
              <Text>Additional content for testing shifts</Text>
            </div>
          </div>

          <Divider />

          <div>
            <Text strong>Test 2: Banner Insertion</Text>
            <Button 
              onClick={handleBannerToggle}
              style={{ marginLeft: 16 }}
            >
              Toggle Banner
            </Button>
            <div style={{ position: 'relative', minHeight: '200px', marginTop: 16 }}>
              {showBanner && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#ffe58f',
                  marginBottom: '16px',
                }}>
                  <Text strong>Breaking News Banner!</Text>
                  <br />
                  <Text>This banner appears at the top and pushes content down</Text>
                  <br />
                  <Text>Additional banner content to create more shift</Text>
                </div>
              )}
              <Text>Main content that gets shifted when the banner appears</Text>
              <br />
              <Text>More content that will be shifted</Text>
              <br />
              <Text>Additional content for testing shifts</Text>
            </div>
          </div>
        </Space>
      </Card>
    </Space>
  );
};

export default CoreWebVitalsMonitor;