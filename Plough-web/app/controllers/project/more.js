import Ember from "ember";
import {
  request
} from "../../utils/http-helpers";
import {
  dateUtils
} from "../../utils/date";
export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  loadProject: [],
  searchValue: "",
  searchedOutputs: [],
  productDetails: [],
  currentObj: "",
  productNodes: [],
  projectEdit: {},
  projectProducts: [],
  addProduction: {},
  isBuget: true,
  errorCode: 0,
  relatedId: "0",
  selectedTeams: [],
  errorInfo: "",
  ProductNode:'',
  teamsTreeNodes: [{
      id: 1,
      pId: 0,
      name: "方案组"
    },
    {
      id: 11,
      pId: 1,
      name: "方案1组"
    },
    {
      id: 12,
      pId: 1,
      name: "方案2组"
    },
    {
      id: 13,
      pId: 1,
      name: "方案3组"
    },
    {
      id: 14,
      pId: 1,
      name: "方案4组"
    },
    {
      id: 15,
      pId: 1,
      name: "方案5组"
    },
    {
      id: 2,
      pId: 0,
      name: "白金组"
    },
    {
      id: 21,
      pId: 2,
      name: "白金产品组"
    },
    {
      id: 22,
      pId: 2,
      name: "BI套件组"
    },
    {
      id: 23,
      pId: 2,
      name: "移动业务大数据组"
    },
    {
      id: 24,
      pId: 2,
      name: "行业应用大数据组"
    },
    {
      id: 25,
      pId: 2,
      name: "移动网络大数据组"
    },
    {
      id: 3,
      pId: 0,
      name: "平台组"
    },
    {
      id: 31,
      pId: 3,
      name: "平台产品组"
    },
    {
      id: 32,
      pId: 3,
      name: "DM组"
    },
    {
      id: 33,
      pId: 3,
      name: "OP组"
    },
    {
      id: 34,
      pId: 3,
      name: "套件组"
    },
    {
      id: 35,
      pId: 3,
      name: "前端组"
    },
    {
      id: 36,
      pId: 3,
      name: "HC组"
    },
    {
      id: 37,
      pId: 3,
      name: "RDB组"
    },
    {
      id: 38,
      pId: 3,
      name: "安全组"
    },
    {
      id: 4,
      pId: 0,
      name: "数据智能组"
    },
    {
      id: 41,
      pId: 4,
      name: "数据智能产品组"
    },
    {
      id: 42,
      pId: 4,
      name: "SE组"
    },
    {
      id: 43,
      pId: 4,
      name: "I3组"
    },
    {
      id: 44,
      pId: 4,
      name: "AI组"
    },
    {
      id: 45,
      pId: 4,
      name: "BDP组"
    },
    {
      id: 5,
      pId: 0,
      name: "UDS组"
    },
    {
      id: 51,
      pId: 5,
      name: "UIUE组"
    },
    {
      id: 52,
      pId: 5,
      name: "分析组"
    },
    {
      id: 53,
      pId: 5,
      name: "CICD组"
    },
    {
      id: 54,
      pId: 5,
      name: "i-deliver组"
    },
    {
      id: 55,
      pId: 5,
      name: "p-deliver组"
    },
    {
      id: 56,
      pId: 5,
      name: "pms-deliver组"
    },
    {
      id: 57,
      pId: 5,
      name: "s-deliver组"
    },
    {
      id: 58,
      pId: 5,
      name: "服务组"
    },
    {
      id: 6,
      pId: 0,
      name: "其他组"
    },
    {
      id: 61,
      pId: 6,
      name: "PMO组"
    }
  ],
  showData: Ember.computed("loadProject", "searchedOutputs", {
    get() {
      if (this.get("searchedOutputs.length") == 0) {
        return this.get("loadProject");
      } else {
        return this.get("searchedOutputs");
      }
    }
  }),
  dataChanged: Ember.observer("loadProject", "searchValue", function () {
    Ember.run.debounce(this, this.searching, 500);
  }),
  doLoadProjects() {
    request({
      name: "get.allSolProject.api",
      type: "get",
      data: {}
    }).then(data => {
      var toNumber = ['projectPrice', 'process', 'lastMonthWorkTime', 'totalWorkTime', 'confirmedProgress']
      data.forEach((val) => {
        toNumber.forEach((key) => {
          if (val[key]) {
            val[key] = Number(val[key]);
          }
        })
      })
      this.set("loadProject", data);
    });
  },
  searching() {
    let _result = [];
    let _attrs = [
      "projectId",
      "projectAlias",
      "projectManagerId",
      "contractNo"
    ];
    if ("" !== this.get("searchValue")) {
      let _search = this.get("searchValue");
      this.get("loadProject").forEach(val => {
        if (this._isEqualOfSearching(val, _attrs, _search)) {
          _result.push(val);
        }
      });
    }
    this.set("searchedOutputs", _result);
  },
  _isEqualOfSearching(val, attrs, value) {
    let _status = false;
    return attrs.reduce((_status, _val) => {
      if (Ember.isNone(val[_val])) {
        return _status;
      } else {
        return _status || val[_val].toString().indexOf(value) >= 0;
      }
    }, false);
  },

  actions: {
    loadStep() {
      this.doLoadProjects();
    },
    lookDetails(obj) {
      this.set("currentObj", obj);
      request({
        name: "get.project.production.api",
        type: "post",
        data: {
          id: this.get("currentObj.id")
        }
      }).then(datas => {
        this.set("productNodes", datas);
        $("#look-details-pane").modal();
      });
    },
    editProjectForm(obj) {
      $("#team-selecter").hide();
      this.set("projectEdit", obj);
      this.set('addProduction.version', '');
      if (obj.isBudget == true) {
        this.set("isBuget", true);
      } else {
        this.set("isBuget", false);
      }
      request({
        name: "get.project.production.api",
        type: "post",
        data: {
          id: this.get("projectEdit.id")
        }
      }).then(datas => {
        this.set("projectProducts", datas);
        $("#project-mana-edit-pane").modal();
      });
    },
    changeBudget: function (e) {
      this.toggleProperty("isBuget");
      this.get("isBuget") == true ?
        this.set("projectEdit.isBudget", true) :
        this.set("projectEdit.isBudget", false);
      console.log(this.get("projectEdit.isBudget"));
    },
    editProject() {
      let lastProject = this.get("projectEdit");
      let reg = /^(((\d*).\d+)|(\d+.(\d*)|\d+))$/;
      if (
        lastProject.projectManagerId == "" ||
        lastProject.projectAlias == ""
      ) {
        this.set(
          "errorInfo",
          "*部分为必填项"
        );
      } else if ((!reg.test(parseFloat(lastProject.nodeCount)) && lastProject.nodeCount !== "") || !reg.test(parseFloat(lastProject.projectPrice))) {
        this.set(
          "errorInfo",
          "项目金额、总结点数、节点数部分只能输入数字"
        );
      } else {
        this.get("projectProducts") ? this.set('projectEdit.productTypeCount', this.get("projectProducts").length) : this.set('projectEdit.productTypeCount', 0);
        if (this.get('projectProducts') !== null && this.get('projectProducts').length == 0) {
          let delId = {
            'relatedId': this.get('projectEdit.id')
          }
          this.get('projectProducts').pushObject(delId);
          console.log(this.get('projectProducts'));
        }
        request({
          name: "edit.project.api",
          type: "post",
          data: this.get("projectEdit")
        }).then(data => {
          this.set("errorCode", data);
        });
        request({
          name: "change.projet.production.api",
          type: "post",
          data: this.get("projectProducts")
        }).then(() => {});
        $("#project-mana-edit-pane").modal("hide");
        this.set("errorInfo", "");
        // this.set("teamsTreeNodes", this.get("teamsTreeNodes"));
      }
    },

    changeAddProduction(value) {
      this.set("addProduction.productName", value);
    },

    _addOneProduct() {
      let reg = new RegExp("^[0-9]*$");
      if (!reg.test(this.get("addProduction.productNode"))) {
        this.set(
          "errorInfo",
          "节点数部分只能输入数字"
        );
      } else if (this.get("addProduction.productNode") == "" || this.get("addProduction.version") == "") {
        this.set("errorInfo", "*处为必填项");
      } else {
        let _addProduction = JSON.parse(
          JSON.stringify(this.get("addProduction"))
        );
        let _projectProducts = this.get("projectProducts") || [];
        if (_addProduction) {
          let newProjectProducts = [];
          _projectProducts.forEach(item => {
            if (item.version !== _addProduction.version) {
              newProjectProducts.pushObject(item);
            }
          });
          newProjectProducts.unshiftObject(_addProduction);
          newProjectProducts.forEach(item => {
            item.relatedId = this.get("projectEdit.id");
          })
          this.set("projectProducts", newProjectProducts);
          console.log(this.get("projectProducts"));
          this.set("errorInfo", "");
          this.set("addProduction.productNode", "");
          this.set("addProduction.version", "");
        }
      }
    },
    delProjectProducts(value) {
      let _projectProducts = JSON.parse(
        JSON.stringify(this.get("projectProducts"))
      );
      let newProjectProducts = [];
      _projectProducts.forEach(function (item) {
        if (
          item.productName !== value.productName ||
          item.productNode !== value.productNode ||
          item.version !== value.version
        ) {
          newProjectProducts.pushObject(item);
        }
      });
      this.set("projectProducts", newProjectProducts);
    },

    changeInvolvedRegion(v) {
      this.set("projectEdit.involvedRegion", v);
    },
    changePurchaseType(v) {
      this.set("projectEdit.purchaseType", v);
    },
    changeProjectType(v) {
      this.set("projectEdit.projectType", v);
    },
    changeProjectLevel(v) {
      this.set("projectEdit.projectLevel", v);
    },
    changeProjectClassify(v) {
      this.set("projectEdit.projectClassify", v);
    },

    showHistory(relatedId) {
      console.log(relatedId);
      Ember.$("#history-info").modal("show");
      this.set("relatedId", relatedId);
    },
    doCloseHistory(){
      this.doLoadProjects();
    },

    changeSelect(e) {
      $("#team-selecter").toggle();
      e.stopPropagation();
    },
    closeSelector() {
      $("#team-selecter").hide();
    },

    checkTeamOnAdd(node) {
      if (node.checked) {
        !this.get("selectedTeams").includes(node) &&
          this.get("selectedTeams").addObject(node);
      } else {
        this.get("selectedTeams").removeObject(node);
      }
      var newSelectTeams = "";
      this.get("selectedTeams").forEach(function (item) {
        newSelectTeams == "" ?
          (newSelectTeams = newSelectTeams + item.name) :
          (newSelectTeams = newSelectTeams + "，" + item.name);
      });
      this.set("projectEdit.teams", newSelectTeams);
    }
  }
});
