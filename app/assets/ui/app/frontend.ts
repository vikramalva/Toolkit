/// <reference path="helper.ts"/>
const exampleSequence = ">AAN59974.1 histone H2A [Homo sapiens]\nMSG------------------RGKQGG-KARAKAKTRSSRAGLQFPVGRVHRLLRKGNYAERVGAGAPVYLAAVLEYLTAEILELAGNAARDNKKTRIIPRHLQLAIRNDEELNKLLGKVTIAQGGVLPNIQAVLLPKKTESHHKAKGK-----\n>NP_001005967.1 histone 2, H2a [Danio rerio]\nMSG------------------RGKTGG-KARAKAKSRSSRAGLQFPVGRVHRLLRKGNYAERVGAGAPVYLAAVLEYLTAEILELAGNAARDNKKTRIIPRHLQLAVRNDEELNKLLGGVTIAQGGVLPNIQAVLLPKKTEKPAKSK-------\n>NP_001027366.1 histone H2A [Drosophila melanogaster]\nMSG------------------RGK-GG-KVKGKAKSRSDRAGLQFPVGRIHRLLRKGNYAERVGAGAPVYLAAVMEYLAAEVLELAGNAARDNKKTRIIPRHLQLAIRNDEELNKLLSGVTIAQGGVLPNIQAVLLPKKTEKKA----------\n>NP_175517.1 histone H2A 10 [Arabidopsis thaliana]\nMAG------------------RGKTLGSGSAKKATTRSSKAGLQFPVGRIARFLKKGKYAERVGAGAPVYLAAVLEYLAAEVLELAGNAARDNKKTRIVPRHIQLAVRNDEELSKLLGDVTIANGGVMPNIHNLLLPKKTGASKPSAEDD----\n>NP_001263788.1 Histone H2A [Caenorhabditis elegans]\nMSG------------------RGKGGKAKTGGKAKSRSSRAGLQFPVGRLHRILRKGNYAQRVGAGAPVYLAAVLEYLAAEVLELAGNAARDNKKTRIAPRHLQLAVRNDEELNKLLAGVTIAQGGVLPNIQAVLLPKKTGGDKEIRLSNLPKQ\n>NP_009552.1 histone H2A [Saccharomyces cerevisiae S288C]\nMSG------------------GKGGKAGSAAKASQSRSAKAGLTFPVGRVHRLLRRGNYAQRIGSGAPVYLTAVLEYLAAEILELAGNAARDNKKTRIIPRHLQLAIRNDDELNKLLGNVTIAQGGVLPNIHQNLLPKKSAKTAKASQEL----\n>XP_641587.1 histone H2A [Dictyostelium discoideum AX4]\nMSETKPASSKPAAAAKPKKVIPRVSRTGEPKSKPESRSARAGITFPVSRVDRLLREGRFAPRVESTAPVYLAAVLEYLVFEILELAHNTCSISKKTRITPQHINWAVGNDLELNSLFQHVTIAYGGVLPTPQQSTGEKKKKPSKKAAEGSSQIY";
// Update the value with the one from the local storage


interface Window { FrontendAlnvizComponent: any; }

window.FrontendAlnvizComponent = {
    controller: function() {
        let submitted : boolean;
        submitted = false;
        return {
            frontendSubmit: function() : any {
                if (!submitted) {
                    return $.ajax({
                        url: '/api/frontendSubmit/Alnviz',
                        type: 'POST',
                        success: function(result) {
                            console.log('ok');
                            submitted = true;
                        },
                        error: function(result) {
                            console.warn('error');
                            submitted = true;
                        }
                    });
                } else {

                }
            },
            initMSA: function() : any {
                let alignment, defMenu, menuOpts, opts, seqs, counter, i;
                seqs = $('#alignment').reformat('Fasta');
                let height = (seqs.split('>').length-1)*15;
                let split = seqs.split('\n');
                counter = 0;
                i = 1;
                while(!split[i].startsWith('>')) {
                    counter = counter + split[i].length;
                    i++;
                }
                let width = counter * 15;
                if (!seqs) {
                    return;
                }
                opts = {
                    colorscheme: {
                        "scheme": "mae"
                    },
                    el: document.getElementById('bioJSContainer'),
                    vis: {
                        conserv: false,
                        overviewbox: false,
                        seqlogo: false,
                        labels: true,
                        labelName: true,
                        labelId: false,
                        labelPartition: false,
                        labelCheckbox: false
                    },
                    menu: 'small',
                    seqs : fasta2json(seqs),
                    zoomer : {
                        alignmentHeight: height,
                        alignmentWidth: width,
                        labelNameLength: 165,
                        labelWidth: 85,
                        labelFontsize: "13px",
                        labelIdLength: 75,
                        menuFontsize: "12px",
                        menuMarginLeft: "2px",
                        menuItemFontsize: "14px",
                        menuItemLineHeight: "14px",
                        autoResize: true
                    }
                };

                alignment = new msa.msa(opts);
                menuOpts = {
                    el : document.getElementById('menuDiv'),
                    msa : alignment
                };
                defMenu = new msa.menu.defaultmenu(menuOpts);
                alignment.addView('menu', defMenu);

                alignment.render();

                //hide unsused options
                $('#menuDiv').children().eq(5).hide();
                $('#menuDiv').children().eq(6).hide();


                setTimeout(function(){
                    $('#tab-Visualization').removeAttr('style');
                }, 100);
                return $('#tool-tabs').tabs('option', 'active', $('#tool-tabs').tabs('option', 'active') + 1);
            },
            forwardTab: function() {
                return $('#tool-tabs').tabs('option', 'active', $('#tool-tabs').tabs('option', 'active') + 1);
            }
        };
    },
    view: function(ctrl : any) {
        return m("div", {
            id: "jobview"
        }, [
            m("div", {
                "class": "jobline"
            }, m("span", {
                "class": "toolname"
            }, "AlignmentViewer"), m("i", {"class": "icon-white_question helpicon"})), m(GeneralTabComponent, {
                tabs: ["Alignment", "Visualization"],
                ctrl: ctrl
            })
        ]);
    }
};



let fndt = function(elem : any, isInit : boolean) : any {
    if (!isInit) {
        return $(elem).foundation();
    }
};

interface Window { FrontendReformatComponent: any; }

window.FrontendReformatComponent = {
    controller: function() {
        return {
            html: m.request({
                method: "GET",
                url: "/static/get/reformat",
                deserialize: function(data) {
                    return data;
                }
            })
        };
    },
    view: function(ctrl : any) {
        return m("div", {
            id: "jobview",
            config: fndt
        }, m.trust(ctrl.html()));
    }
};





let renderTabs = function(tabs : any, content : any) {
    return m("div", {
        "class": "tool-tabs",
        id: "tool-tabs",
        config: tabulated
    }, [
        m("ul", tabs.map(function(tab : any) {
            return m("li", {
                id: "tab-" + tab
            }, m("a", {
                href: "#tabpanel-" + tab
            }, tab));
        })), tabs.map(function(tab : any, idx : number) {
            return m("div", {
                "class": "tabs-panel",
                id: "tabpanel-" + tab
            }, content[idx]);
        })
    ]);
};

let GeneralTabComponent = {

    controller: function() {
        let mo = {
            isFullScreen : false,
            label: "Expand"
        };
        let onCollapse : any, onExpand : any, onFullscreenToggle : any;
        return {
            getLabel: (function() {
                return this.label;
            }).bind(mo),
            fullscreen: (function() {
                let job_tab_component;
                job_tab_component = $("#tool-tabs");
                if (this.isFullscreen) {
                    job_tab_component.removeClass("fullscreen");
                    this.isFullscreen = false;
                    if (typeof onCollapse === "function") {
                        onCollapse();
                    }
                    $("#collapseMe").addClass("fa-expand").removeClass("fa-compress");
                    followScroll(document);

                } else {
                    job_tab_component.addClass("fullscreen");
                    this.isFullscreen = true;
                    if (typeof onExpand === "function") {
                        onExpand();
                    }
                    $("#collapseMe").addClass("fa-compress").removeClass("fa-expand");
                    followScroll(job_tab_component);

                }
                if (typeof onFullscreenToggle === "function" && this.isFullscreen === true) {
                    return onFullscreenToggle();
                }
            }).bind(mo),
            forwardString: (function () {
                if (localStorage.getItem("resultcookie")) {
                    let cookieString = String(localStorage.getItem("resultcookie"));
                    localStorage.removeItem("resultcookie");
                    $.LoadingOverlay("hide")
                    return cookieString;
                } else {
                    return "";
                }
            }).bind(mo)
        };
    },
    view: function(ctrl : any, args : any) {
        return m("div", {
            "class": "tool-tabs",
            id: "tool-tabs",
            config: tabulated
        }, [
            m("ul", args.tabs.map(function(tab : any) {
                return m("li", {
                    id: "tab-" + tab,
                    style: (tab == "Visualization" ? "display: none;" : "display: block;")
                }, m("a", {
                    href: "#tabpanel-" + tab
                }, tab));
            }), m("li", {
                style: "float: right;"
            }, m("i", {
                type: "button",
                id: "collapseMe",
                "class": "fa fa-expand button_fullscreen",
                value: ctrl.getLabel(),
                onclick: ctrl.fullscreen,
                config: closeShortcut
            }))), args.tabs.map(function(tab : any) {
                return m("div", {
                    "class": "tabs-panel",
                    id: "tabpanel-" + tab
                }, tabsContents[tab](args.ctrl));
            })
        ]);
    }
};


let tabsContents : any = {
    "Alignment": function(ctrl : any) {
        return m("div", {
            "class": "parameter-panel", "id": "alignmentViewerPanel"
        }, [
            m("textarea", {
                name: "alignment",
                placeholder: "Enter sequences in FASTA or CLUSTAL format.",
                options: [["fas", "FASTA"]],
                id: "alignment",
                rows: 25,
                value: GeneralTabComponent.controller().forwardString(),
                spellcheck: false
            }),
            m("input", {
                id: "pasteButton",
                "class": "button small alignmentExample",
                value: "Paste Example",
                config: sampleSeqConfig,
                onclick: function() {
                    $('#alignment').val(exampleSequence);
                }
            }),
            m("div", {
                "class": "submitbuttons",
                onclick: ctrl.frontendSubmit
            }, m("input", {
                type: "button",
                "class": "success button small submitJob",
                value: "View Alignment",
                onclick: ctrl.initMSA,
                id: "viewAlignment"
            }))
        ]);
    },
    "Visualization": function(ctrl : any) {
        return m("div", [
            m("div", {
                id: "menuDiv"
            }), m("div", {
                id: "bioJSContainer"
            })
        ]);
    },
    "Freqs": function(ctrl : any) {
        return "Test";
    }
};
