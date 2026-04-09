import { describe, expect, it } from "vitest";
import { parseTable } from "@/lib/espn/provider";

describe("parseTable", () => {
  it("maps ESPN leaderboard columns by header name", () => {
    const html = `
      <table>
        <thead>
          <tr>
            <th></th>
            <th>POS</th>
            <th>PLAYER</th>
            <th>SCORE</th>
            <th>THRU</th>
            <th>R1</th>
            <th>R2</th>
            <th>R3</th>
            <th>R4</th>
            <th>TOT</th>
            <th>EARNINGS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td>1</td>
            <td>Rory McIlroy</td>
            <td>-11</td>
            <td>F</td>
            <td>72</td>
            <td>66</td>
            <td>66</td>
            <td>73</td>
            <td>277</td>
            <td>$4,200,000</td>
          </tr>
          <tr>
            <td></td>
            <td>T36</td>
            <td>Ludvig Åberg</td>
            <td>E</td>
            <td>14</td>
            <td>68</td>
            <td>75</td>
            <td>74</td>
            <td>71</td>
            <td>288</td>
            <td>$0</td>
          </tr>
        </tbody>
      </table>
    `;

    expect(parseTable(html)).toEqual([
      {
        name: "Rory McIlroy",
        position: "1",
        status: "-11",
        thru: "F",
        r1: 72,
        r2: 66,
        r3: 66,
        r4: 73,
        total: 277
      },
      {
        name: "Ludvig Åberg",
        position: "T36",
        status: "E",
        thru: "14",
        r1: 68,
        r2: 75,
        r3: 74,
        r4: 71,
        total: 288
      }
    ]);
  });
});
