
document.getElementById("btn-compute").addEventListener("click", handleClick);

listR = document.getElementById("list-r")
valueM = document.getElementById("m-value")

const resultTemplate = document.getElementById("result-template").content;
const resultList = document.getElementById("result-list");
const filterResult = document.getElementById("filter-result");

const EPSILON = 1e-5;

// conversion to radius
const CONV = 82 / 45 / 2;
// distance between the two
const DIST = 250;

const DIST_CONV = DIST / CONV;

const MAIN_RATIO = 6;

function isTriangle(a, b, c) {
    return a + b >= c && a + c >= b && b + c >= a;
}

function computeAngle(a, b, c) {
    return Math.acos((a * a + b * b - c * c) / (2 * a * b));
}

function simplify(n) {
    if (n.length == 4 && n[1] === n[2]) {
        return [n[0], n[1], n[3]];
    } else {
        return n;
    }
}

function uniqueCount(arr) {
    const counts = {};
    for (var i = 0; i < arr.length; i++) {
        counts[arr[i]] = 1 + (counts[arr[i]] || 0);
    }
    return counts;
}

function enoughGear(n, count_map) {
    const n_s = uniqueCount(simplify(n));
    for (const [ni, size] of Object.entries(n_s)) {
        if (!(ni in count_map) || count_map[ni] < size) {
            return false;
        }
    }
    return true;
}

function feasible(n, count_map) {
    let [a, b] = [n[0] + n[1], n[2] + n[3]];

    if (n[1] > b || n[2] > a || !isTriangle(a, b, DIST_CONV)) return false;
    if (!enoughGear(n, count_map)) return false;
    return true;
}

function findFeasible(class_a, class_b, count_map, is_filter) {
    res = []
    class_a.forEach(a => {
        class_b.forEach(b => {
            const n = a.concat(b);
            if (!is_filter || feasible(n, count_map)) {
                res.push(n);
            }
        })
    })
    return res;
}

function createItem(result) {

    var newNode = document.importNode(
        resultTemplate,
        true
    ).firstElementChild;


    let angle = result[2].map(x => {
        const a = (x[0] + x[1]);
        const c = (x[2] + x[3]);
        return computeAngle(a, DIST_CONV, c) / Math.PI * 180;
    })

    newNode.getElementsByClassName("result-conf")[0].innerText = result[2].map(a => simplify(a).join(",")).join("\n");
    newNode.getElementsByClassName("result-angle")[0].innerText = angle.map(x => x.toFixed(2) + "°").join("\n");
    newNode.getElementsByClassName("result-size")[0].innerText = result[1].toFixed(8);
    newNode.getElementsByClassName("result-error")[0].innerText = (result[0] * 100).toFixed(4) + "%";
    resultList.appendChild(newNode);
}

function parseR(str) {
    return str.split(',').map((x) => {
        const val = x.split('x');
        if (val.length == 2) {
            return val.map(x => parseInt(x.trim()));
        } else {
            return [parseInt(val[0].trim()), 1];
        }
    })
}

function handleClick(e) {
    const Rs = parseR(listR.value);
    const M = parseFloat(valueM.value.trim()) / MAIN_RATIO;
    const possible_sum = [];
    const count_map = Object.fromEntries(Rs);
    const is_filter = filterResult.checked;

    Rs.forEach(r1 => {
        Rs.forEach(r2 => {
            possible_sum.push([r1[0] / r2[0], [r1[0], r2[0]]]);
        })
    });

    possible_sum.sort((x, y) => x[0] - y[0]);

    ratio_classes = [];

    for (let i = 0; i < possible_sum.length; ++i) {
        let [r, pair] = possible_sum[i];
        let [r_last, pair_last] = ratio_classes.length ? ratio_classes[ratio_classes.length - 1] : [0, []];
        if (r < r_last + EPSILON) {
            pair_last.push(pair);
        } else {
            ratio_classes.push([r, [pair]]);
        }
    }

    let j = ratio_classes.length - 1;
    let res = []

    for (let i = 0; i < ratio_classes.length; i++) {
        let [ra, class_a] = ratio_classes[i];
        while (j > 0 && ra * ratio_classes[j][0] > M) {
            --j;
        }


        let check = (pos) => {
            let [rb, class_b] = ratio_classes[pos];
            let sol = findFeasible(class_a, class_b, count_map, is_filter);
            if (sol.length) {
                let error = Math.abs(ra * rb / M - 1);
                res.push([error, ra * rb * MAIN_RATIO, sol]);
                return true;
            }
        }

        for (let k = j; k >= 0; --k)
            if (check(k)) break;

        for (let k = j + 1; k < ratio_classes.length; ++k)
            if (check(k)) break;
    }

    res.sort((a, b) => a[0] - b[0])

    resultList.replaceChildren();
    res.slice(0, 100).forEach((x) => createItem(x));
}
