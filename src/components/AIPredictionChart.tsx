
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

interface PredictionPoint {
  timestamp: string;
  price: number;
}
interface Props {
  pair: string;
}
const API_BASE_URL = "http://localhost:5000/api";

const AIPredictionChart: React.FC<Props> = ({ pair }) => {
  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/predictions?pair=${encodeURIComponent(pair)}&hours=24`);
        setPredictions(res.data);
      } catch (e) {
        setPredictions([]);
      }
      setLoading(false);
    })();
  }, [pair]);

  return (
    <Card className="bg-crypto-card border-gray-800 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">AI Prediction - {pair}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-gray-400">Loading prediction...</div>
        ) : predictions.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={predictions}>
              <XAxis dataKey="timestamp" hide />
              <YAxis
                domain={["auto", "auto"]}
                allowDecimals
                tickFormatter={(v) => `$${v}`}
                width={60}
              />
              <Tooltip formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`} labelFormatter={() => ""} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#c084fc"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-red-400">No AI prediction data available.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIPredictionChart;
