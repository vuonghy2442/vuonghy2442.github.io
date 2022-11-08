
document.getElementById("btn-compute").addEventListener("click", handleClick);

listR = document.getElementById("list-r")
valueM = document.getElementById("m-value")

const resultTemplate = document.getElementById("result-template").content;
const resultList = document.getElementById("result-list");

const EPSILON = 1e-5;

// conversion to radius
const CONV = 82 / 45 / 2;
// distance between the two
const DIST = 250;

const MAXIMUM_ERROR = 0.01;

const MAIN_RATIO = 6;

function isTriangle(a, b, c) {
    return a + b >= c + EPSILON && a + c >= b + EPSILON && b + c >= a + EPSILON;
}

function computeAngle(a, b, c) {
    return Math.acos((a * a + b * b - c * c) / (2 * a * b));
}

function feasible(n) {
    let r = n.map(x => CONV * x);
    let [a, b] = [r[0] + r[1], r[2] + r[3]];

    if (r[1] + EPSILON > b || r[2] + EPSILON > a || !isTriangle(a, b, DIST)) return false;
    return true;
}

function findFeasible(class_a, class_b) {
    res = []
    class_a.forEach(a => {
        class_b.forEach(b => {
            const n = a.concat(b);
            if (feasible(n)) {
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
        const a = CONV * (x[0] + x[1]);
        const b = DIST;
        const c = CONV * (x[2] + x[3]);
        return computeAngle(a, b, c) / Math.PI * 180;
    })

    newNode.getElementsByClassName("result-conf")[0].innerText = result[2].map(a => a.join(",")).join("\n");
    newNode.getElementsByClassName("result-angle")[0].innerText = angle.map(x => x.toFixed(2) + "°").join("\n");
    newNode.getElementsByClassName("result-size")[0].innerText = result[1].toFixed(8);
    newNode.getElementsByClassName("result-error")[0].innerText = (result[0] * 100).toFixed(4) + "%";
    resultList.appendChild(newNode);
}

function handleClick(e) {
    const Rs = listR.value.split(',').map((x) => parseFloat(x.trim()));
    const M = parseFloat(valueM.value.trim()) / MAIN_RATIO;
    const possible_sum = [];

    Rs.forEach(r1 => {
        Rs.forEach(r2 => {
            possible_sum.push([r1 / r2, [r1, r2]]);
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
            let sol = findFeasible(class_a, class_b);
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
