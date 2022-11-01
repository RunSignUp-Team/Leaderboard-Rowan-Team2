import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

const Hello = () => {
  return <div>hello world</div>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}

const params = `?api_key=fl6UtJPAkHn3jylC2s9P7LQ39eYd489e&api_secret=L3QCcl8zAVa3gM8ONfTsdmRcedCpBLQl&format=json&event_id=519982`;

async function start() {
  const response = await fetch(
    `https://runsignup.com/rest/race/50801/results/get-results${params}`
  );

  const data = await response.json();

  interface Person {
    bib: number;
    result_id: number;
    first_name: string;
    last_name: string;
    clock_time: string;
  }

  // Format data for uploading
  const dataToUpload = data.individual_results_sets[0].results.map(
    (person: Person) => {
      const {
        bib,
        first_name: firstName,
        last_name: lastName,
        clock_time: clockTime,
        result_id: resultId,
      } = person;
      return {
        bib,
        firstName,
        lastName,
        clockTime,
        resultId,
      };
    }
  );

  // // Upload data to express server
  // const serverRes = await fetch('http://localhost:3000/upload-data', {
  //   method: 'POST',
  //   body: JSON.stringify(dataToUpload),
  // });
}

start();
