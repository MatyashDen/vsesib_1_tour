#include "testlib.h"
#include <iostream>
#include <vector>
#include <string>
#include <fstream>

using namespace std;

const int MAX_STEP_COUNT = 10 * 1000 * 1000;

// ================== Point ===================================================

struct Point {
	int x, y;
	Point(int _x, int _y) : x(_x), y(_y) {}
};

Point operator+ (Point a, Point b) { return Point(a.x + b.x, a.y + b.y); }
Point operator- (Point a, Point b) { return Point(a.x - b.x, a.y - b.y); }
void operator+= (Point &a, Point b) { a = a + b; }
void operator-= (Point &a, Point b) { a = a - b; }
bool operator== (Point a, Point b) { return a.x == b.x && a.y == b.y; }
bool operator!= (Point a, Point b) { return !(a == b); }

// ================== Class for current state of bot ==========================

class BotState {
public:
	Point pos;      // current coordinates
	bool filled;    // bot carries a crate?

	BotState(Point _pos, bool _f) : pos(_pos), filled(_f) {}
};

const Point OUTSIDE = Point(-1, -1);

// ================== main ====================================================

int main(int argc, char* argv[]) {
	setName("GameRound2020 Checker");
	registerTestlibCmd(argc, argv);

	const int n = inf.readInt();
	const int m = inf.readInt();
	const int k = inf.readInt();
	const int p = inf.readInt();
	
	vector< vector<int> > field(n, vector<int>(m, true));
	vector <Point> portals;
	for (int i = 0; i < p; i++) {
		int inX = inf.readInt();
		int inY = inf.readInt();
		field[inX][inY] = false; // portal cells are empty
		portals.push_back(Point(inX, inY));
	}

	// read answer
	int answerTime = ouf.readInt(0, MAX_STEP_COUNT, "duration");
	ouf.ensuref(k * answerTime <= MAX_STEP_COUNT, "Total number of bot actions exceeded: %d > %d", k * answerTime, MAX_STEP_COUNT);
	
	vector<string> cargoBotLog;

	for (int i = 0; i < k; i++) {
		string blog = ouf.readToken();

		// preliminary validation and preprocessing the answer
		ouf.ensuref(blog.size() == answerTime, "Bot %d has %d commands instead of %d\n", i, int(blog.size()), answerTime);
		for (int j = 0; j < answerTime; j++) {
			char ch = blog[j];

			if (ch >= 'a' && ch <= 'z') {
				ch += 'A' - 'a';    // case-insensitive
			}
			if (ch == '.') {
				ch = 'W';           // alias
			}
			blog[j] = ch;

			ouf.ensuref(strchr("LRUDWE1234567890", ch), "[Tick %d] Bot %d has unknown command: %c [%d]", j, i, ch, int(ch));
			if (ch >= '0' && ch <= '9') {
				int portalNum = ch - '0';
				ouf.ensuref(portalNum < p, "[Tick %d] Bot %d enters nonexisting portal %d", j, i, portalNum);
			}
		}

		cargoBotLog.push_back(blog);
	}

	vector <BotState> states(k, BotState(OUTSIDE, false));
	for (int step = 0; step < answerTime; step++) {

		vector <BotState> newStates;
		for (int b = 0; b < k; b++) {
			char actionChar = cargoBotLog[b][step];

			// compute new coordinates
			BotState nextState = states[b];

			if (states[b].pos == OUTSIDE) { // bot was outside, can do anything except 'E'
				ouf.ensuref(actionChar != 'E', "[Tick %d] Bot %d exits while already being outside", step, b);

				if (actionChar >= '0' && actionChar <= '9') { // bot uses portal to go inside
					int portalNum = actionChar - '0';
					nextState.pos = portals[portalNum];
				}
				else {
					// ignore movement commands while being outside
				}
			}
			else { // bot was inside
				ouf.ensuref(!(actionChar >= '0' && actionChar <= '9'), "[Tick %d] Bot %d enters while already being inside", step, b);

				if (actionChar == 'E') {
					int portalNum = -1;
					for (int i = 0; i < p; i++) {
						if (portals[i] == states[b].pos) {
							portalNum = i;
							break;
						}
					}
					ouf.ensuref(portalNum != -1, "[Tick %d] Bot %d exits at (%d,%d) where no portal exists", step, b, states[b].pos.x, states[b].pos.y);

					nextState = BotState(OUTSIDE, false);
				}
				else {
					if (actionChar == 'L') {
						nextState.pos.y--;
					}
					else if (actionChar == 'R') {
						nextState.pos.y++;
					}
					else if (actionChar == 'U') {
						nextState.pos.x--;
					}
					else if (actionChar == 'D') {
						nextState.pos.x++;
					}
					else if (actionChar == 'W') {
						// wait: nothing to do
					}

					// check if new state is out of bounds
					ouf.ensuref(
						nextState.pos.x >= 0 && nextState.pos.x < n && nextState.pos.y >= 0 && nextState.pos.y < m,
						"[Tick %d] Bot %d goes out of bounds: (%d,%d)",
						step, b, nextState.pos.x, nextState.pos.y
					);

					// check if we stepped onto crate
					if (field[nextState.pos.x][nextState.pos.y]) {
						ouf.ensuref(
							!nextState.filled,
							"[Tick %d] Bot %d runs into crate at (%d,%d) while already carrying another crate",
							step, b, nextState.pos.x, nextState.pos.y
						);

						nextState.filled = true;
						field[nextState.pos.x][nextState.pos.y] = 0;
					}
				}
			}

			newStates.push_back(nextState);
		}

		// check if any two bots collide
		for (int i = 0; i < k; i++) {
			for (int j = 0; j < i; j++) {
				// if a' == b' then bots run into same cell
				if (newStates[i].pos == newStates[j].pos) {
					ouf.ensuref(
						newStates[i].pos == OUTSIDE, // it's okay to move/stay to outside location with many bots
						"[Tick %d] Bots %d and %d run into the same cell (%d,%d)",
						step, j, i, newStates[i].pos.x, newStates[i].pos.y
					);
				}

				// if a == b' and a' == b then bots collide trying to swap places
				if (newStates[i].pos == states[j].pos && newStates[j].pos == states[i].pos) {
					ouf.ensuref(
						states[i].pos == states[j].pos, // it's okay to stay at outside, but not move to/from it
						"[Tick %d] Bots %d and %d collide face-to-face at (%d,%d) and (%d,%d)",
						step, i, j, states[j].pos.x, states[j].pos.y, states[i].pos.x, states[i].pos.y
					);
				}
			}
		}

		// copy newStates to states
		states = newStates;
	}

	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m; j++) {
			ouf.ensuref(!field[i][j], "Crate still present at (%d,%d) after plan is over", i, j);
		}
	}

	for (int i = 0; i < states.size(); i++) {
		ouf.ensuref(!states[i].filled, "Bot %d at (%d,%d) still carries a crate after plan is over", i, states[i].pos.x, states[i].pos.y);
	}

	quitf(_ok, "All crates removed in %d ticks", answerTime);
}
