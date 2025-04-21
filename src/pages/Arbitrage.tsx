
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArbitrageType from '@/components/ArbitrageType';
import { Button } from '@/components/ui/button';
import { cryptoPairs } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CirclePlay, CircleStop, LoaderCircle } from 'lucide-react';

const Arbitrage = () => {
  const { toast } = useToast();
  const [arbitrageType, setArbitrageType] = useState('simple');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [strategyRunning, setStrategyRunning] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [processingState, setProcessingState] = useState<'idle' | 'analyzing' | 'executing' | 'completed'>('idle');
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  
  const handleArbitrageTypeChange = (type: string) => {
    setArbitrageType(type);
    toast({
      title: "Strategy Changed",
      description: `Switched to ${type} arbitrage strategy`,
    });
  };
  
  const handleRunArbitrage = () => {
    setStrategyRunning(true);
    setProcessingState('analyzing');
    setExecutionLogs([]);
    
    // Add initial log
    addExecutionLog(`Starting ${arbitrageType} arbitrage analysis for ${selectedPair}`);
    
    // Simulate analysis phase
    setTimeout(() => {
      addExecutionLog(`Analyzing market conditions for ${selectedPair}`);
      addExecutionLog(`Checking price differentials across exchanges`);
      
      setTimeout(() => {
        setProcessingState('executing');
        addExecutionLog(`Found potential arbitrage opportunity`);
        
        // Generate mock performance data
        const mockData = generatePerformanceData(selectedPair, arbitrageType);
        
        setTimeout(() => {
          setPerformanceData(mockData);
          setProcessingState('completed');
          addExecutionLog(`Arbitrage execution completed successfully`);
          
          toast({
            title: "Arbitrage Strategy Completed",
            description: `Successfully analyzed ${selectedPair} using ${arbitrageType} strategy`,
          });
        }, 2000);
      }, 2000);
    }, 2000);
  };
  
  const addExecutionLog = (log: string) => {
    setExecutionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };
  
  const generatePerformanceData = (pair: string, strategy: string) => {
    const data = [];
    let initialValue = 1000;
    
    // Different performance patterns based on strategy
    for (let i = 0; i < 20; i++) {
      // Different growth patterns based on strategy
      if (strategy === 'simple') {
        initialValue *= (1 + (Math.random() * 0.01));
      } else if (strategy === 'triangular') {
        initialValue *= (1 + (Math.random() * 0.015));
      } else {
        initialValue *= (1 + (Math.random() * 0.02));
      }
      
      data.push({
        time: i,
        value: initialValue.toFixed(2)
      });
    }
    
    return data;
  };
  
  const getProcessingIcon = () => {
    switch (processingState) {
      case 'analyzing':
        return <LoaderCircle className="h-5 w-5 text-amber-500 animate-spin" />;
      case 'executing':
        return <CirclePlay className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CircleStop className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Arbitrage Strategies</h1>
            <p className="text-gray-600">Configure and run automatic arbitrage strategies</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {/* Strategy Configuration */}
              <div className="space-y-6">
                <ArbitrageType 
                  onTypeChange={handleArbitrageTypeChange}
                  selectedType={arbitrageType}
                />
                
                <Card className="bg-white border-gray-200 shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-gray-800">Trading Pair</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cryptoPairs.map(pair => (
                        <button
                          key={pair}
                          onClick={() => setSelectedPair(pair)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedPair === pair 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pair}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleRunArbitrage}
                  disabled={strategyRunning && processingState !== 'completed'}
                >
                  {strategyRunning && processingState !== 'completed' ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      Running Strategy...
                    </>
                  ) : (
                    'Run Arbitrage Strategy'
                  )}
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {/* Results and Visualization */}
              <Card className="bg-white border-gray-200 shadow mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-800 flex items-center">
                    <span>Strategy Performance</span>
                    {processingState !== 'idle' && (
                      <span className="ml-2 flex items-center">
                        {getProcessingIcon()}
                        <span className="ml-1 text-sm capitalize text-gray-600">{processingState}</span>
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <XAxis dataKey="time" />
                          <YAxis domain={['dataMin', 'dataMax']} />
                          <Tooltip formatter={(value) => [`$${value}`, 'Portfolio Value']} />
                          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="mt-4 text-center text-sm text-gray-600">
                        <p>
                          Initial: $1000.00 → Final: ${performanceData[performanceData.length - 1]?.value}
                        </p>
                        <p className="text-green-600 font-medium">
                          Profit: ${(parseFloat(performanceData[performanceData.length - 1]?.value) - 1000).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600 py-16">
                      {processingState !== 'idle' 
                        ? "Processing arbitrage strategy..." 
                        : "Select a strategy and click \"Run Arbitrage Strategy\" to see performance metrics."}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-800">Execution Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  {executionLogs.length > 0 ? (
                    <div className="bg-gray-50 rounded-md p-2 h-40 overflow-y-auto text-xs space-y-1">
                      {executionLogs.map((log, index) => (
                        <div key={index} className="py-1 px-2 text-gray-700 font-mono">
                          {log}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-600 py-8">
                      Execution logs will appear here when you run a strategy.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Arbitrage;
