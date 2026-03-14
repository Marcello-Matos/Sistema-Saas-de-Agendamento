// ============================================
// INICIALIZAÇÃO
// ============================================

// 86. Inicialização do DOM
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    addCalendarStyles();
    loadSavedColors();
    
    appointmentsChart = new ApexCharts(document.querySelector("#appointmentsChart"), {
        series: [
            { name: 'Compareceram', data: [] },
            { name: 'Faltaram', data: [] }
        ],
        chart: { 
            type: 'bar', 
            height: 250, 
            toolbar: { show: false },
            animations: { enabled: true },
            stacked: false,
            background: 'transparent'
        },
        colors: [defaultColors.success, defaultColors.danger],
        dataLabels: { enabled: false },
        stroke: { 
            curve: 'smooth', 
            width: 2,
            colors: ['#ffffff']
        },
        grid: { 
            borderColor: '#e5e7eb',
            strokeDashArray: 4
        },
        xaxis: {
            categories: [],
            labels: { 
                style: { 
                    colors: '#6b7280',
                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                } 
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { 
                style: { 
                    colors: '#6b7280',
                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                } 
            },
            title: {
                text: 'Número de alunos',
                style: { 
                    color: '#6b7280',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontWeight: 500
                }
            }
        },
        tooltip: { 
            theme: 'dark',
            y: {
                formatter: function(val) {
                    return val + ' aluno' + (val !== 1 ? 's' : '');
                }
            },
            style: {
                fontFamily: 'Plus Jakarta Sans, sans-serif'
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            labels: { 
                colors: '#1f2937',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 500
            },
            markers: {
                radius: 4,
                width: 12,
                height: 12
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '60%',
                distributed: false
            }
        },
        fill: {
            opacity: 1,
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: ['#059669', '#b91c1c'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        }
    });
    appointmentsChart.render();

    // GRÁFICO DE DISTRIBUIÇÃO DE PLANOS
    servicesChart = new ApexCharts(document.querySelector("#servicesChart"), {
        series: [],
        chart: {
            type: 'donut',
            height: 320,
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            background: 'transparent',
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 10,
                color: '#000',
                opacity: 0.08
            },
            events: {
                dataPointMouseEnter: function(event) {
                    event.target.style.cursor = 'pointer';
                }
            }
        },

        colors: [defaultColors.primary, defaultColors.secondary, defaultColors.success, defaultColors.warning, defaultColors.danger],

        labels: ['MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'AVULSO'],

        plotOptions: {
            pie: {
                expandOnClick: true,
                donut: {
                    size: '72%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '13px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: 600,
                            color: '#6b7280',
                            offsetY: -8
                        },
                        value: {
                            show: true,
                            fontSize: '26px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: 700,
                            color: '#1f2937',
                            offsetY: 8,
                            formatter: function(val) {
                                return val;
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Clientes',
                            fontSize: '13px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: 600,
                            color: '#6b7280',
                            formatter: function(w) {
                                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                return total;
                            }
                        }
                    }
                },
                dataLabels: {
                    offset: -5,
                    minAngleToShowLabel: 15
                }
            }
        },

        dataLabels: {
            enabled: true,
            formatter: function(val, opts) {
                if (val < 8) return '';
                return val.toFixed(1) + '%';
            },
            style: {
                fontSize: '12px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 700,
                colors: ['#ffffff']
            },
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 3,
                color: '#00000055',
                opacity: 0.6
            }
        },

        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            floating: false,
            fontSize: '13px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 500,
            offsetY: 4,
            labels: {
                colors: '#1f2937',
                useSeriesColors: false
            },
            markers: {
                width: 12,
                height: 12,
                radius: 6,
                strokeWidth: 0,
                offsetY: 1
            },
            itemMargin: {
                horizontal: 14,
                vertical: 6
            },
            formatter: function(seriesName, opts) {
                const val = opts.w.globals.series[opts.seriesIndex] || 0;
                return `${seriesName} &nbsp;<strong>${val}</strong>`;
            }
        },

        tooltip: {
            enabled: true,
            fillSeriesColor: false,
            style: {
                fontSize: '13px',
                fontFamily: 'Plus Jakarta Sans, sans-serif'
            },
            y: {
                formatter: function(val, opts) {
                    const total = opts.w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                    return `${val} cliente${val !== 1 ? 's' : ''} (${pct}%)`;
                },
                title: {
                    formatter: function(seriesName) {
                        return `Plano ${seriesName}:`;
                    }
                }
            }
        },

        stroke: {
            show: true,
            width: 3,
            colors: ['#ffffff']
        },

        states: {
            hover: {
                filter: { type: 'darken', value: 0.08 }
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: { type: 'darken', value: 0.18 }
            }
        },

        responsive: [
            {
                breakpoint: 1200,
                options: {
                    chart: { height: 290 },
                    plotOptions: {
                        pie: { donut: { size: '70%' } }
                    }
                }
            },
            {
                breakpoint: 768,
                options: {
                    chart: { height: 270 },
                    legend: {
                        position: 'bottom',
                        fontSize: '11px',
                        itemMargin: { horizontal: 8, vertical: 4 }
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '68%',
                                labels: {
                                    value: { fontSize: '20px' },
                                    name:  { fontSize: '11px' }
                                }
                            }
                        }
                    },
                    dataLabels: { enabled: false }
                }
            }
        ]
    });
    servicesChart.render();

    
    reportsLineChart = new ApexCharts(document.querySelector("#reportsLineChart"), {
        series: [{ name: 'Agendamentos', data: [] }],
        chart: { type: 'line', height: 250, toolbar: { show: false } },
        colors: [defaultColors.primary],
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories: [] }
    });
    reportsLineChart.render();
    
    reportsPieChart = new ApexCharts(document.querySelector("#reportsPieChart"), {
        series: [],
        chart: { type: 'pie', height: 250 },
        labels: [],
        colors: [defaultColors.primary, defaultColors.success, defaultColors.warning]
    });
    reportsPieChart.render();
    
    reportsBarChart = new ApexCharts(document.querySelector("#reportsBarChart"), {
        series: [{ name: 'Agendamentos', data: [] }],
        chart: { type: 'bar', height: 250, toolbar: { show: false } },
        colors: [defaultColors.secondary],
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        xaxis: { categories: [] }
    });
    reportsBarChart.render();
    
    const today = new Date();
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate) startDate.value = lastWeek.toISOString().split('T')[0];
    if (endDate) endDate.value = today.toISOString().split('T')[0];
    
    const reportPeriod = document.getElementById('reportPeriod');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', function() {
            console.log('📊 Período alterado para:', this.value);
            loadReportsData();
        });
    }
    
    if (document.getElementById('reportsView').classList.contains('active')) {
        loadReportsData();
    }
});