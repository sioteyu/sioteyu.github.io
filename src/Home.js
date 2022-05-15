import logo from "./logo.svg";
import "./assets/home.css";
import {Routes, Route, Link, useNavigate} from "react-router-dom";
import {Button, Grid, Card} from "@mui/material";
import React, {useState} from "react";
import moment from "moment";
import {fetchLatest} from "./services/CryptoService.js";

function Home() {
  const [btcusd, setBtcusd] = useState({prev: 0, curr: 0});
  const [btceur, setBtceur] = useState({prev: 0, curr: 0});
  const [btcaud, setBtcaud] = useState({prev: 0, curr: 0});
  const navigate = useNavigate();

  const getLatestData = () => {
    fetchLatest().then(data => {
      console.log(btceur);
      setBtcusd(prev => {
        return {prev: prev.curr, curr: data.rates.USD};
      });
      setBtceur(prev => {
        return {prev: prev.curr, curr: data.rates.EUR};
      });
      setBtcaud(prev => {
        return {prev: prev.curr, curr: data.rates.AUD};
      });
    });
  };

  React.useEffect(() => {
    getLatestData();
    setInterval(() => {
      getLatestData();
    }, 60000);
  }, []);

  return (
    <div className="container">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card
            className="clickable"
            onClick={() => {
              navigate("/History/btcusd");
            }}
          >
            <h1
              className={
                btcusd.curr < btcusd.prev
                  ? "red"
                  : btcusd.curr == btcusd.prev
                  ? "black"
                  : "green"
              }
            >
              {btcusd.curr}
            </h1>
            <p>BTC/USD</p>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            className="clickable"
            onClick={() => {
              navigate("/History/btcaud");
            }}
          >
            <h1
              className={
                btcaud.curr < btcaud.prev
                  ? "red"
                  : btcusd.curr == btcusd.prev
                  ? "black"
                  : "green"
              }
            >
              {btcaud.curr}
            </h1>
            <p>BTC/AUD</p>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            className="clickable"
            onClick={() => {
              navigate("/History/btceur");
            }}
          >
            <h1
              className={
                btceur.curr < btceur.prev
                  ? "red"
                  : btcusd.curr == btcusd.prev
                  ? "black"
                  : "green"
              }
            >
              {btceur.curr}
            </h1>
            <p>BTC/EUR</p>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default Home;
