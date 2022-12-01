import { useEffect, useRef, useState } from "react";
import { ListGroup } from "react-bootstrap";
import {
  MemoryRouter as Router,
  Route,
  Routes,
  NavLink,
} from "react-router-dom";
import Table from "react-bootstrap/Table";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

async function filter(arr, callback) {
  // eslint-disable-next-line
  const fail = Symbol();
  return (
    await Promise.all(
      // eslint-disable-next-line
      arr.map(async (item) => ((await callback(item)) ? item : fail))
    )
  ).filter((i) => i !== fail);
}

const PreDisplayPage = () => {
  return (
    <div className="mt-5 container">
      <h1 className="text-center ">Race Name and ID</h1>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          value=""
          id="position"
        />
        <label className="form-check-label" for="position">
          Position
        </label>
      </div>
      <div className="form-check">
        <input className="form-check-input" type="checkbox" value="" id="bib" />
        <label className="form-check-label" for="bib">
          Bib #
        </label>
      </div>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          value=""
          id="firstName"
        />
        <label className="form-check-label" for="firstName">
          First Name
        </label>
      </div>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          value=""
          id="lastName"
        />
        <label className="form-check-label" for="lastName">
          Last Name
        </label>
      </div>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          value=""
          id="finishTime"
        />
        <label className="form-check-label" for="finishTime">
          Finish Time
        </label>
      </div>

      <div className="mt-5 d-flex gap-5">
        <label for="customRange2" className="form-label">
          Scroll Speed
        </label>
        <input
          type="range"
          className="form-range w-75"
          min="0"
          max="5"
          id="customRange2"
        />
        <output>0%</output>
      </div>

      <div className="d-flex align-items-center gap-5 mt-5">
        <label for="customRange2" className="form-label">
          Text Size
        </label>

        <DropdownButton title="Text Size">
          <Dropdown.Item>Small</Dropdown.Item>
          <Dropdown.Item>Medium</Dropdown.Item>
          <Dropdown.Item>Large</Dropdown.Item>
        </DropdownButton>
      </div>

      <div className="d-flex gap-5 align-items-center mt-5">
        <label className="form-label">Placement Range</label>
        <input
          type="number"
          className="form-control"
          placeholder="Starting Range"
        />
        -
        <input
          type="number"
          className="form-control"
          placeholder="Ending Range"
        />
      </div>
      <div className="text-center">
        <button className="btn btn-primary mt-5 btn-lg">Display Table</button>
      </div>
    </div>
  );
};

const TablePage = (props) => {
  document.addEventListener("scroll", (e) => {
    let documentHeight = document.body.scrollHeight;
    let currentScroll = window.scrollY + window.innerHeight;

    if (currentScroll >= documentHeight) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  });

  useEffect(() => {
    setInterval(() => {
      window.scrollBy({
        top: 20,
        behavior: "smooth",
      });
    }, 1000);
  }, []);

  useEffect(() => {});
  const { resultData } = props;
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  window.electron.ipcRenderer.sendMessage("save-data", resultData);
  return (
    <Table striped bordered hover>
      <div ref={topRef} />
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
        {resultData.map((person) => {
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
      <div ref={bottomRef} />
    </Table>
  );
};

const MainPage = () => {
  const params = `?api_key=fl6UtJPAkHn3jylC2s9P7LQ39eYd489e&api_secret=L3QCcl8zAVa3gM8ONfTsdmRcedCpBLQl&format=json`;
  const [inputValue, setInputValue] = useState("");
  const [eventData, setEventData] = useState([]);

  async function onSubmit() {
    const response = await fetch(
      `https://runsignup.com/rest/race/${inputValue}/${params}`
    );

    const data = await response.json();

    if (data.race.events) {
      const { events } = data.race;

      const eventsWithResults = await filter(events, async (event) => {
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
      <NavLink to="options" className="btn btn-primary">
        Open Options Page
      </NavLink>
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
  window.electron.ipcRenderer.on("get-data", (data) => {
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
        <Route path="/options" element={<PreDisplayPage />} />
      </Routes>
    </Router>
  );
}
