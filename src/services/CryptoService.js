import moment from "moment";

export async function fetchLatest() {
  const response = await fetch(
    `https://api.exchangerate.host/latest?symbols=EUR,USD,AUD&base=BTC&source=crypto`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  return await response.json();
}

export async function fetchLast10days() {
  let start = moment();
  let end = moment().subtract(10, "d");
  const response = await fetch(
    `https://api.exchangerate.host/timeseries?start_date=${end.format(
      "YYYY-MM-DD"
    )}&end_date=${start.format(
      "YYYY-MM-DD"
    )}&symbols=EUR,USD,AUD&base=BTC&source=crypto`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  return await response.json();
}
