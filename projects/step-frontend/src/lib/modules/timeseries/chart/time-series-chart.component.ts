import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    Self,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import {TSChartSettings} from './model/ts-chart-settings';

@Component({
  selector: 'step-timeseries-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss'],
})
export class TimeSeriesChartComponent implements OnInit, AfterViewInit, OnChanges {

    private readonly HEADER_WITH_FOOTER_SIZE = 94;

    @ViewChild('chartContainer') private chartContainer: ElementRef;

    @Input('settings') settings: TSChartSettings;

    uplot: uPlot;

    constructor(@Self() private element: ElementRef) {
        console.log();
    }

    ngOnInit(): void {
        // @ts-ignore
    }

    ngAfterViewInit(): void {

        let getSize = () => {
            console.log(this.element.nativeElement.parentElement);
            return {
                width: this.element.nativeElement.parentElement.offsetWidth,
                height: this.element.nativeElement.parentElement.offsetHeight - this.HEADER_WITH_FOOTER_SIZE,
            }
        }

        const opts = {
            title: this.settings.title,
            ...getSize(),
            scales: {
                x: {
                    time: true,
                },
                y: {
                },
            },
            series: [
                {
                    label: "x",
                },
                ...this.settings.series.map(input => {
                   return {
                       // show: true,
                       // snapGaps: false,
                       label: 'sa',
                       // show: !input.hidden,
                       stroke: input.stroke,
                       // fill: input.fill,
                       value: (self: any, rawValue: number) => input.valueFormatFunction(rawValue),
                       dash: [],
                       width: 1
                   } ;
                })
            ],
        };

        // @ts-ignore
        this.uplot = new uPlot(opts, [this.settings.xValues, ...this.settings.series.map(s => s.data)], this.chartContainer.nativeElement);

        // function throttle(cb: FrameRequestCallback, limit: number) {
        //     var wait = false;
        //
        //     return () => {
        //         if (!wait) {
        //             requestAnimationFrame(cb);
        //             wait = true;
        //             setTimeout(() => {
        //                 wait = false;
        //             }, limit);
        //         }
        //     }
        // }

        if (this.settings.autoResize) {
            window.addEventListener("resize", e => {
                this.uplot.setSize(getSize());
            });
        }
        //	window.addEventListener("resize", throttle(() => u.setSize(getSize()), 100));

    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    update(): void {

    }

}
