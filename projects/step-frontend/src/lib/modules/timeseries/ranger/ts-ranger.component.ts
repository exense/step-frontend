import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {TSRangerSettings} from './ts-ranger-settings';
import {UplotSyncService} from '../chart/uplot-sync-service';

declare const uPlot: any;

@Component({
    selector: 'step-ts-ranger',
    templateUrl: './ts-ranger.component.html',
    styleUrls: ['./ts-ranger.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TsRangerComponent implements OnInit, AfterViewInit {

    @ViewChild('chart') private chartElement: ElementRef;

    @Input('settings') settings: TSRangerSettings;
    @Input('syncKey') syncKey: string;

    uplot: any;

    ngOnInit(): void {
        uPlot.sync(this.syncKey);
    }

    ngAfterViewInit(): void {
        this.createRanger();
    }

    createRanger() {
        // @ts-ignore
        let x0;let lft0: number;let wid0: number;
        // @ts-ignore
        const lftWid = {left: null, width: null};
        // @ts-ignore
        const minMax = {min: null, max: null};

        // @ts-ignore
        let placeDiv = function(par, cls) {
            let el = document.createElement("div");
            el.classList.add(cls);
            par.appendChild(el);
            return el;
        }
        // @ts-ignore
        let on = function(ev, el, fn) {
            el.addEventListener(ev, fn);
        }
        // @ts-ignore
        let off = function(ev, el, fn) {
            el.removeEventListener(ev, fn);
        }
        // @ts-ignore
        let debounce = function(fn) {
            // @ts-ignore
            let raf;
            // @ts-ignore
            return (...args) => {
                // @ts-ignore
                if (raf)
                    return;

                raf = requestAnimationFrame(() => {
                    fn(...args);
                    raf = null;
                });
            };
        }
        // @ts-ignore
        let bindMove = (e, onMove) => {
            x0 = e.clientX;
            lft0 = this.uplot.select.left;
            wid0 = this.uplot.select.width;

            const _onMove = debounce(onMove);
            on("mousemove", document, _onMove);

            // @ts-ignore
            const _onUp = e => {
                off("mouseup", document, _onUp);
                off("mousemove", document, _onMove);
                let linkedCharts = uPlot.sync('test').plots;
                console.log(this.uplot);
                let minMax: any = {
                    min: this.uplot.posToVal(this.uplot.select.left , 'x'),
                    max: this.uplot.posToVal(this.uplot.select.left + this.uplot.select.width , 'x'),
                };
                linkedCharts.forEach((chart: any) => {
                    if (chart === this.uplot) { // TODO find a better way to avoid this
                        return;
                    }
                    // minMax.min = this.uplot.min
                    // minMax.max = this.uplot.posToVal(newLft + newWid, 'x');
                    chart.setScale('x', minMax);
                })
                // viaGrip = false;
            };
            on("mouseup", document, _onUp);

            e.stopPropagation();
        }

            // @ts-ignore
        let select = (newLft, newWid) => {
            lftWid.left = newLft;
            lftWid.width = newWid;
            this.uplot.setSelect(lftWid, false);
        }

        // @ts-ignore
        let zoom = (newLft, newWid) => {
            console.log('zoom');
            // minMax.min = this.uplot.posToVal(newLft, 'x');
            // minMax.max = this.uplot.posToVal(newLft + newWid, 'x');
            // uZoomed.setScale('x', minMax);
        }

        // @ts-ignore
        let update = (newLft, newWid) => {
            let newRgt = newLft + newWid;
            let maxRgt = this.uplot.bbox.width / devicePixelRatio;

            if (newLft >= 0 && newRgt <= maxRgt) {
                select(newLft, newWid);
                zoom(newLft, newWid);
            }
        }

        let rangerOpts = {
            width: 800,
            height: 100,
            cursor: {
                y: false,
                points: {
                    show: false,
                },
                drag: {
                    setScale: false,
                    x: true,
                    y: false,
                },
                sync: {
                    key: "test"
                }
            },
            legend: {
                show: false
            },
            scales: {

            },
            series: [
                {},
                {
                    points: {show: false},
                    stroke: "#9fd6ff",
                    fill: () => {
                        let gradient = this.uplot.ctx.createLinearGradient(0, 0, 0, 100);
                        gradient.addColorStop(0, '#2e6c7c');
                        gradient.addColorStop(1, '#2e6c7c' + '07');
                        return gradient;
                    }
                    // fill: "#9fd6ff"
                }
            ],
            hooks: {
                ready: [
                    // @ts-ignore
                    uRanger => {
                        let left = Math.round(uRanger.valToPos(this.settings.min, 'x'));
                        let width = Math.round(uRanger.valToPos(this.settings.max, 'x')) - left;
                        let height = uRanger.bbox.height / devicePixelRatio;
                        uRanger.setSelect({left, width, height}, false);

                        const sel = uRanger.root.querySelector(".u-select");
                        console.log(sel);

                        // @ts-ignore
                        on("mousedown", sel, e => {
                            // @ts-ignore
                            bindMove(e, e => update(lft0 + (e.clientX - x0), wid0));
                        });

                        // @ts-ignore
                        on("mousedown", placeDiv(sel, "u-grip-l"), e => {
                            // @ts-ignore
                            bindMove(e, e => update(lft0 + (e.clientX - x0), wid0 - (e.clientX - x0)));
                        });

                        // @ts-ignore
                        on("mousedown", placeDiv(sel, "u-grip-r"), e => {
                            // @ts-ignore
                            bindMove(e, e => update(lft0, wid0 + (e.clientX - x0)));
                        });
                    }
                ],
                setSelect: [
                    // @ts-ignore
                    uRanger => {
                        console.log('SET SELECT', uRanger);
                        zoom(uRanger.select.left, uRanger.select.width);
                    }
                ],
            }
        };
        this.uplot = new uPlot(rangerOpts, [this.getXValues(), ...this.settings.series.map(s => s.data)], this.chartElement.nativeElement);
    }

    getXValues(): number[] {
        let result: number[] = [];
        for (let i = this.settings.min; i <= this.settings.max; i+= 2.5) {
            result.push(i);
        }
        return result;
    }

}
