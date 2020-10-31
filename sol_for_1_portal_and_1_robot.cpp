#include <bits/stdc++.h>
/*#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
#include <ext/rope>*/
#define ll long long
#define ld long double
#define vll vector <ll>
#define vvll vector <vll>
#define pll pair <ll, ll>
#define pld pair <ld, ld>
#define vpll vector <pll>

#define rep(i, a, b) for (ll i = (ll)a; i < (ll)b; i++)
#define per(i, a, b) for (ll i = (ll)a - 1; i >= (ll)b; --i)

#define endl "\n"
#define pb push_back
#define pf push_front

#define all(v) (v).begin(), (v).end()
#define rall(v) (v).rbegin(), (v).rend()

#define sorta(v) sort(all(v))
#define sortd(v) sort(rall(v))
#define vld vector<ld>

#define debug if (1)
#define log(val) debug {clog << "\n" << #val << ": " << val << "\n";}

#define ios ios_base::sync_with_stdio(0); cin.tie(0); cout.tie(0);

#define mod (ll)(1e9 + 7)
#define inf (mod * mod)

using namespace std;
//using namespace __gnu_cxx;
//using namespace __gnu_pbds;

const ll N = 2e5 + 5;

pair <ll, pll> pts[N];

string ans = "";

void move(pll a, pll b) {
    ll dx = a.second - b.second;
    
    ans += "0";
    
    rep(i, 0, abs(dx)) {
        if (dx > 0) {
            ans += "L";
        } else {
            ans += "R";
        }
    }
    
    ll dy = a.first - b.first;
    
    rep(i, 0, abs(dy)) {
        if (dy < 0) {
            ans += "U";
        } else {
            ans += "D";
        }
    }
    // back
    
    rep(i, 0, abs(dy)) {
        if (dy > 0) {
            ans += "U";
        } else {
            ans += "D";
        }
    }
    
    rep(i, 0, abs(dx)) {
        if (dx < 0) {
            ans += "L";
        } else {
            ans += "R";
        }
    }
    
    ans += "E";
}

ll getDst(pll a, pll b) {
    return abs(a.first - b.first) + abs(a.second - b.second);
}

void solve() {
    freopen("input.txt", "r", stdin);
    freopen("output.txt", "w", stdout);
    
    ll n, m, k, p;
    cin >> n >> m >> k >> p;
    assert(p == 1 && k == 1);
    
    pll portal;
    cin >> portal.first >> portal.second;
    ll ptsCnt = 0;
    
    rep(i, 0, n) {
        rep(j, 0, m) {
            if (!(i == portal.first && j == portal.second)) {
                pts[ptsCnt] = {getDst({i, j}, portal), {i, j}};
                ptsCnt++;
            }
        }
    }
    
    sort(pts, pts + ptsCnt);
    
    rep(i, 0, ptsCnt) {
        move(portal, pts[i].second);
    }
    
    cout << ans.size() << endl;
    cout << ans;
}

int main() {
    ios
    // mt19937 rng(chrono::steady_clock::now().time_since_epoch().count())

    // freopen("input.txt", "r", stdin); freopen("output.txt", "w", stdout);
    
    ll tests = 1;
    //cin >> tests;
    while (tests--) {
        solve();
        cout << "\n";
    }

    return 0;
}
