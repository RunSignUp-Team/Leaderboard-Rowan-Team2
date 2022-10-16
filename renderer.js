/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

 const params = `?api_key=fl6UtJPAkHn3jylC2s9P7LQ39eYd489e&api_secret=L3QCcl8zAVa3gM8ONfTsdmRcedCpBLQl&format=json&event_id=519982`;

 // Fetch results from specific  race
 async function start() {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    Origin: "*",
  };
  const response = await fetch(
    "https://runsignup.com/rest/race/50801/results/get-results" + params,
    {
      headers,
    }
  );

  const data = await response.json();

  // Format data for uploading
  const dataToUpload = data.individual_results_sets[0].results.map((person) => {
    const { bib, first_name, last_name, clock_time, result_id } = person;
    return {
      bib,
      first_name,
      last_name,
      clock_time,
      result_id,
    };
  });

  // Upload data to express server
  const serverRes = await fetch("http://localhost:3000/upload-data", {
    method: "POST",
    body: JSON.stringify(dataToUpload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(serverRes, "the server res");
}

start();