import logo from "./logo.svg";
import "./assets/history.css";
import React, {useState, useEffect} from "react";
import {fetchLast10days} from "./services/CryptoService.js";
import {useParams} from "react-router-dom";
import {Container} from "@mui/material";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function History() {
  let {type} = useParams();
  const [history, setHistory] = useState({});
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchLast10days().then(ret => {
      setHistory(ret.rates);
    });
  }, []);

  React.useEffect(() => {
    let temp = [];
    for (let d of Object.keys(history)) {
      temp.push({
        name: d,
        price:
          type == "btcusd"
            ? history[d].USD
            : type == "btceur"
            ? history[d].EUR
            : history[d].AUD
      });
    }
    setData(temp);
  }, [history]);

  const options = React.useMemo(() => [], []);
  return (
    <Container>
      <h1>{type} Price Chart</h1>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          width={1100}
          height={300}
          data={data}
          margin={{top: 5, right: 20, bottom: 5, left: 0}}
        >
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </Container>
  );
}
export default History;
