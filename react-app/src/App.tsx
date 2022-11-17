import { useState } from "react";
import { ListGroup } from "react-bootstrap";
import {
  MemoryRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Table from "react-bootstrap/Table";

interface Event {
  name: string;
  details: string;
  start_time: string;
  event_id: number;
}

interface Person {
  bib: number;
  place: number;
  result_id: number;
  first_name: string;
  last_name: string;
  clock_time: string;
}

type Events = Event[];

async function filter(arr: any, callback: any) {
  // eslint-disable-next-line
  const fail = Symbol();
  return (
    await Promise.all(
      // eslint-disable-next-line
      arr.map(async (item: any) => ((await callback(item)) ? item : fail))
    )
  ).filter((i) => i !== fail);
}

const TablePage = (props: any) => {
  const { resultData } = props;
  window.electron.ipcRenderer.sendMessage("save-data", resultData);
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Position #</th>
          <th>Bib #</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Finish Time</th>
        </tr>
      </thead>
      <tbody>
        {resultData.map((person: Person) => {
          if (!person.place) return null;
          return (
            <tr key={person.result_id}>
              <th>{person.place}</th>
              <th>{person.bib}</th>
              <th>{person.first_name}</th>
              <th>{person.last_name}</th>
              <th>{person.clock_time}</th>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

const MainPage = () => {
  const params = `?api_key=fl6UtJPAkHn3jylC2s9P7LQ39eYd489e&api_secret=L3QCcl8zAVa3gM8ONfTsdmRcedCpBLQl&format=json`;
  const [inputValue, setInputValue] = useState("");
  const [eventData, setEventData] = useState<Events>([]);

  async function onSubmit() {
    const response = await fetch(
      `https://runsignup.com/rest/race/${inputValue}/${params}`
    );

    const data = await response.json();

    if (data.race.events) {
      const { events } = data.race;

      const eventsWithResults = await filter(events, async (event: Event) => {
        const resultResponse = await fetch(
          `https://runsignup.com/rest/race/${inputValue}/results/get-results${params}&event_id=${event.event_id}`
        );

        const results = await resultResponse.json();

        return results.individual_results_sets.length > 0;
      });
      setEventData(eventsWithResults);
    }
  }

  return (
    <div>
      <div className="input-group mb-3">
        <input
          onChange={(e) => setInputValue(e.target.value)}
          type="text"
          value={inputValue}
          className="form-control"
          placeholder="Search By RaceID"
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
        />
        <div className="input-group-append">
          <button onClick={onSubmit} className="btn btn-primary" type="button">
            Search
          </button>
        </div>
      </div>

      {eventData && (
        <ListGroup>
          {eventData.map((event) => {
            return (
              <ListGroup.Item
                key={event.event_id}
                onClick={async () => {
                  const response = await fetch(
                    `https://runsignup.com/rest/race/${inputValue}/results/get-results${params}&event_id=${event.event_id}`
                  );

                  const data = await response.json();

                  // setResultData(data.individual_results_sets[0].results);

                  window.electron.ipcRenderer.sendMessage(
                    "create-window",
                    data.individual_results_sets[0].results
                  );
                }}
              >
                {event.name} - {event.start_time}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
};

export default function App() {
  const [resultData, setResultData] = useState([]);
  window.electron.ipcRenderer.on("get-data", (data: any) => {
    console.log(data, "the data");
    setResultData(data);
  });

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            resultData.length > 0 ? (
              <TablePage resultData={resultData} />
            ) : (
              <MainPage />
            )
          }
        />
      </Routes>
    </Router>
  );
}
