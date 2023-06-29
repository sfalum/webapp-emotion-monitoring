/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  const keyValuePairs = {
    0: "screaming",
    1: "crying",
    2: "laughing",
  };

  let prediction;

  let maxLenght = 11;
  let laugh_chat_data = new Array(maxLenght);
  let cry_chart_data = new Array(maxLenght);
  let scream_chart_data = new Array(maxLenght);
  let emo_dist_data = [0, 0, 0];

  let total_messages = 0;
  let total_alerts = 0;

  let laughCounter = 0;
  let screamCounter = 0;
  let cryCounter = 0;

  var emo_dist_ctx = document
    .getElementById("emotion-distribution-chart")
    .getContext("2d");

  // Create the data for the chart
  var emoDistData = {
    labels: ["Screaming", "Crying", "Laughing"],
    datasets: [
      {
        label: "My Dataset",
        data: [0, 0, 0],
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(50, 205, 50, 0.8)",
        ],
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Create the chart
  var emotionDistchart = new Chart(emo_dist_ctx, {
    type: "pie",
    data: emoDistData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  var real_time_ctx = document
    .getElementById("real-time-chart")
    .getContext("2d");

  var realTimeData = {
    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    datasets: [
      {
        label: "Lauging",
        borderColor: "green",
        fill: false,
      },
      {
        label: "Crying",
        borderColor: "yellow",
        fill: false,
      },
      {
        label: "Screaming",
        borderColor: "red",
        fill: false,
      },
    ],
  };

  var realTimeOptions = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  var realTimeChart = new Chart(real_time_ctx, {
    type: "line",
    data: realTimeData,
    options: realTimeOptions,
  });

  function addData(laugh, cry, scream) {
    laugh_chat_data.push(laugh);
    cry_chart_data.push(cry);
    scream_chart_data.push(scream);

    if (laugh_chat_data.length > maxLenght) {
      laugh_chat_data.shift();
      cry_chart_data.shift();
      scream_chart_data.shift();
    }
  }

  const protocol = document.location.protocol.startsWith("https")
    ? "wss://"
    : "ws://";
  const webSocket = new WebSocket(protocol + location.host);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    try {
      const recivedData = JSON.parse(message.data);
      const messageData = recivedData.IotData;

      console.log(messageData);

      const alertData = recivedData.alert;

      if (typeof alertData === "undefined") {
        total_messages++;

        // Adding Data to Weather chart and Battery Chart

        prediction = messageData.prediction;

        document.getElementById("device_id").textContent = messageData.deviceId;

        const date = new Date(messageData.timestamp);

        const formattedDateTime = date.toLocaleString();
        document.getElementById("date_time").textContent = formattedDateTime;

        switch (prediction) {
          case 0:
            screamCounter++;
            addData(0, 0, 1);
            break;
          case 1:
            cryCounter++;
            addData(0, 1, 0);
            break;
          case 2:
            laughCounter++;
            addData(1, 0, 0);
            break;

          default:
            break;
        }

        emo_dist_data = [screamCounter, cryCounter, laughCounter];
        realTimeData.datasets[0].data = laugh_chat_data;
        realTimeData.datasets[1].data = cry_chart_data;
        realTimeData.datasets[2].data = scream_chart_data;
        emoDistData.datasets[0].data = emo_dist_data;
        realTimeChart.update();
        emotionDistchart.update();

        const emo_max = Math.max(...emo_dist_data);
        const emo_index = emo_dist_data.indexOf(emo_max);

        document.getElementById("frequent_emotion").textContent =
          keyValuePairs[emo_index];
        document.getElementById("current_result").textContent =
          keyValuePairs[prediction];

        // Farm Statistics

        document.getElementById("total_messages").textContent = total_messages;
      } else {
        total_alerts++;
        document.getElementById("total_alerts").textContent = total_alerts;
        document.getElementById("alert_message").textContent =
          alertData.message;
        document.getElementById("alert_box").className = "alertShow";
      }
    } catch (err) {
      console.error(err);
    }
  };
});
