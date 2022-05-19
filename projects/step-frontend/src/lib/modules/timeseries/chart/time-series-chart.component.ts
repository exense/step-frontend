import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";

@Component({
  selector: 'step-timeseries-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss'],
})
export class TimeSeriesChartComponent implements OnInit {

    @ViewChild('chartContainer') private chartContainer: ElementRef;

    constructor() {

        var loop = 1e2;

        let data = [
            Array(loop),
            Array(loop),
        ];

        for (var i = 0; i < loop; i++) {
            let x = 2 * Math.PI * i / loop;
            let y = Math.sin(x);

            data[0][i] = x;
            data[1][i] = y;
        }

        function getSize() {
            return {
                width: window.innerWidth - 100,
                height: window.innerHeight - 200,
            }
        }

        const opts = {
            title: "Resize",
            ...getSize(),
            scales: {
                x: {
                    time: false,
                },
                y: {
                    auto: false,
                    range: [-1.5, 1.5],
                },
            },
            series: [
                {
                    label: "x",
                },
                {
                    label: "sin(x)",
                    stroke: "red",
                }
            ],
        };

        // @ts-ignore
        let u = new uPlot(opts, data, this.chartContainer.nativeElement);

        function throttle(cb: FrameRequestCallback, limit: number) {
            var wait = false;

            return () => {
                if (!wait) {
                    requestAnimationFrame(cb);
                    wait = true;
                    setTimeout(() => {
                        wait = false;
                    }, limit);
                }
            }
        }

        //	window.addEventListener("resize", throttle(() => u.setSize(getSize()), 100));
        window.addEventListener("resize", e => {
            u.setSize(getSize());
        });

    }

    ngOnInit(): void {
        // @ts-ignore

    }

}
