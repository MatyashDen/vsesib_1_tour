#include "testlib.h"
#include <algorithm>
#include <set>

using namespace std;

typedef pair<int, int> pii;

const int MAXMN = 100;

void gen_n_pairs(int n, set<pii>& S, int rangeX, int rangeY) {
	while (S.size() < n) {
		int x_i = rnd.next(0, rangeX-1);
		int y_i = rnd.next(0, rangeY-1);
		S.insert(make_pair(x_i, y_i));
	}
}

int main(int argc, char *argv[]) {
	if (argc < 6) {
		fprintf(stderr, "gen_random <N> <M> <K> <P> <seed>\n");
		return -1;
	}

	registerGen(argc, argv, 1);

	int n, m, k, p;
	sscanf(argv[1], "%d", &n);
	sscanf(argv[2], "%d", &m);
	sscanf(argv[3], "%d", &k);
	sscanf(argv[4], "%d", &p);

	// gen portals coordinates
	set <pii> S;
	gen_n_pairs(p, S, n, m);

	printf("%d %d %d %d\n", n, m, k, p);
	for (auto el : S) {
		printf("%d %d\n", el.first, el.second);
	}

	return 0;
}
