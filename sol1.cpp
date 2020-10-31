#include <bits/stdc++.h>
//#include <ext/pb_ds/assoc_container.hpp>
//#include <ext/pb_ds/tree_policy.hpp>
//#include <ext/rope>

#define ll long long
#define ll128 __uint128_t
#define ld long double
#define pll pair <ll, ll>

#define vll vector <ll>
#define vld vector<ld>
#define vpll vector<pll>

#define vvll vector <vll>

#define rep(i, a, b) for(ll i = (ll)a; i < (ll)b; i++)
#define per(i, a, b) for(ll i = (ll)a - 1; i >= (ll)b; --i)

#define endl "\n"
#define pb push_back
#define pf push_front

#define all(v) (v).begin(), (v).end()
#define rall(v) (v).rbegin(), (v).rend()

#define sorta(v) sort(all(v))
#define sortd(v) sort(rall(v))

#define debug if (1)
#define log(val) debug {cout << "\n" << #val << ": " << val << "\n";}

#define ios ios_base::sync_with_stdio(0); cin.tie(0); cout.tie(0);
#define file(name) freopen(name".in", "r", stdin); freopen(name".out", "w", stdout);
#define FILE freopen("input.txt", "r", stdin); freopen("output.txt", "w", stdout);

#define mod (ll)(1e9 + 7)
#define inf (mod * mod)

#define int long long

using namespace std;
//using namespace __gnu_cxx;
//using namespace __gnu_pbds;

ostream & operator << (ostream & out, vll & a) {
    for(auto i : a) out << i << " ";
    return out;
}

istream & operator >> (istream & in, vll & a) {
    for(auto &i : a) in >> i;
    return in;
}

const int N = 115, P = 15;

struct portal {
    int x, y;
} prt[P];

ll n, m, k, p;
ll id[N][N];

void bfs(ll x, ll y, ll mx, ll idd) {
    queue<pll> q;
    vvll d(n + 1, vll(m + 1, 1e18));
    vvll color(n + 1, vll(m + 1, 0));
    rep(i, 0, p) {
        color[prt[i].x][prt[i].y] = i + 1;
        if (mx > 0) q.push(make_pair(prt[i].x, prt[i].y));
        d[prt[i].x][prt[i].y] = 0;
    }

    while(!q.empty()) {
        auto fr = q.front();
        q.pop();

        rep(di, -1, 2) {
            rep(dj, -1, 2) {
                if (di * di + dj * dj != 1) continue;
                ll ni = fr.first + di;
                ll nj = fr.second + dj;
                if (ni >= 0 && ni < n && nj >= 0 && nj < m && !color[ni][nj]) {
                    if (d[fr.first][fr.second] + 1 < d[ni][nj]) {
                        color[ni][nj] = color[fr.first][fr.second];
                        d[ni][nj] = d[fr.first][fr.second] + 1;
                        if (d[ni][nj] < mx) {
                            q.push(make_pair(ni, nj));
                        }
                    }
                }
            }
        }
    }

    rep(i, 0, n) {
        rep(j, 0, m) {
            if (id[i][j] != -1) {
                id[i][j] = color[i][j];
            }
        }
    }
}

void read() {
    cin >> n >> m >> k >> p;
    swap(n, m);
    rep(i, 0, p) {
        cin >> prt[i].x >> prt[i].y;
        swap(prt[i].x, prt[i].y);
        id[prt[i].x][prt[i].y] = -1;
    }
}

void findId() {
    auto check = [&](ll mid) {
        rep(i, 0, p) {
            bfs(prt[i].x, prt[i].y, mid, i + 1);
        }

        ll oo = 0;
        rep(i, 0, n) {
            rep(j, 0, m) {
                if (id[i][j] == 0) {
                    oo = 1;
                }
            }
        }

        return oo;
    };

    ll l = 0, r = n * m;
    while(l + 1 < r) {
        ll m = (l + r) / 2;
        if (check(m)) {
            l = m + 1;
        } else {
            r = m;
        }

        rep(i, 0, n) {
            rep(j, 0, m) {
                if (id[i][j] != -1) id[i][j] = 0;
            }
        }
    }

    if (check(l)) l++;
    check(l);
    ll test = 0;
    if (test) {
        cout << "l : " << l << endl;
        cout << endl;
        rep(i, 0, n) {
            rep(j, 0, m) {
                cout << id[i][j] << " ";
            }
            cout << endl;
        }
        cout << endl;
    }
}

int findValue(vector<string> &ans) {
    int val = 0;
    for (auto s : ans) {
        val = max(val, (int)s.size());
    }
    for (int i = 0; i < ans.size(); ++i) {
        while ((int)ans[i].size() < val) {
            ans[i] += 'W';
        }
    }
    return val;
}
 
bool usId[N][N];
 
string findWay(portal a, portal b, int portalId) {
    string ans = "";
 
    ans += char(portalId + '0');
 
    string f = "";
    while (a.x < b.x) {
        f += 'R';
        ++a.x;
    }
    while (a.x > b.x) {
        f += 'L';
        --a.x;
    }
    while (a.y < b.y) {
        f += 'D';
        ++a.y;
    }
    while (a.y > b.y) {
        f += 'U';
        --a.y;
    }
 
    string s = f;
    reverse(s.begin(), s.end());
    for (int i = 0; i < s.size(); ++i) {
        if (s[i] == 'R') s[i] = 'L';
        else
        if (s[i] == 'L') s[i] = 'R';
        else
        if (s[i] == 'U') s[i] = 'D';
        else
        if (s[i] == 'D') s[i] = 'U';
    }
 
    ans += f;
    ans += s;
    ans += 'E';
 
    return ans;
}

void fixId() {
//    for (int i = 0; i < n; ++i) {
//        for (int j = 0; j < m; ++j) {
//            cout << id[i][j] << ' ';
//        }
//        cout << endl;
//    } cout << endl;
    queue<portal> q;
    auto upd = [&](int x, int y, portal pos) {
        if (x >= 0 && x < n && y >= 0 && y < m) {
            if (id[x][y] > k) {
                id[x][y] = id[pos.x][pos.y];
                q.push({x, y});
            }
        }
    };
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            if (id[i][j] <= k && id[i][j] != -1) {
                q.push({i, j});
            }
        }
    }
    while (!q.empty()) {
        auto to = q.front(); q.pop();
        int x = to.x, y = to.y;
        portal pos = {x, y};
        upd(x + 1, y, pos);
        upd(x - 1, y, pos);
        upd(x, y + 1, pos);
        upd(x, y - 1, pos);
    }
//    for (int i = 0; i < n; ++i) {
//        for (int j = 0; j < m; ++j) {
//            cout << id[i][j] << ' ';
//        }
//        cout << endl;
//    }
}

vector<string> findAns() {
    vector<string> ans;
 
    for (int prtId = 0; prtId < p; ++prtId) {
        string s = "";
 
        queue<portal> q;
 
        auto pos = prt[prtId];
        usId[pos.x][pos.y] = true;
        q.push(pos);
 
        auto upd = [&](int x, int y) {
            if (!usId[x][y] && id[x][y] == prtId + 1) {
                portal newPos = {x, y};
                s += findWay(pos, newPos, prtId);
                usId[x][y] = true;
                q.push(newPos);
            }
        };
 
        while (!q.empty()) {
            auto to = q.front(); q.pop();
            int x = to.x, y = to.y;
            upd(x + 1, y); upd(x - 1, y);
            upd(x, y + 1); upd(x, y - 1);
        }
 
        ans.push_back(s);
    }
 
    return ans;
}

void checkAns(portal id, string s) {
    int x = id.x, y = id.y;
    cout << "checkAns: " << x << ' ' << y << endl;
    for (int i = 0; i < s.size(); ++i) {
        if (s[i] == 'L') --x;
        if (s[i] == 'R') ++x;
        if (s[i] == 'U') --y;
        if (s[i] == 'D') ++y;
        cout << x << ' ' << y << ' ' << s[i] << endl;
        assert(x >= 0 && x < n && y >= 0 && y < m);
    }
}

void print() {
    vector<string> ans = findAns();
 
    int val = findValue(ans);
    
    cout << findValue(ans) << endl;
 
    string def = "";
    for (int i = 0; i < val; ++i) {
        def += 'W';
    }
    
//    cout << ans.size() << ' ' << k << endl;
    
    while ((int)ans.size() < k) {
        ans.push_back(def);
    }
    
    int sz = (int)ans.size();
    sz = min(sz, k);
    
    int cnt = 0;
    for (int i = 0; i < sz; ++i) {
        string s = ans[i];
//        checkAns(prt[cnt], s);
        ++cnt;
        cout << s << endl;
    }
}

signed main() {
    // FILE
    read();
    findId();
    fixId();
    print();
    
    return 0;
}
