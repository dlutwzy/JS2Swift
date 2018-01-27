String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
				function (m, i) {
				    return args[i];
				});
}

String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

JSON2Swift = {
    _allClass: [],
    _genClassCode: function (obj, name) {
        var clas = "struct {0}: Codable {\r\n".format(name || "Root");
        for (var n in obj) {
            var v = obj[n];
            n = n.trim();
            clas += "    {0}    var {2}: {1}?\r\n".format(this._genComment(v), this._genTypeByProp(n, v), n);
        }
        clas += "}\r\n";
        this._allClass.push(clas);
        return this._allClass.join("\r\n");
    },
    _genTypeByProp: function (name, val) {
        switch (Object.prototype.toString.apply(val)) {
            case "[object Number]":
                {
                    return val.toString().indexOf(".") > -1 ? "Double" : "Int";
                }
            case "[object Date]":
                {
                    return "Date";
                }
            case "[object Object]":
                {
                    name = name.substring(0, 1).toUpperCase() + name.substring(1);
                    this._genClassCode(val, name);
                    return name;
                }
            case "[object Array]":
                {
                    return "[{0}]".format(this._genTypeByProp(name + "Item", val[0]));
                }
            default:
                {
                    return "String";
                }
        }
    },
    _genComment: function (val) {
    	//return "";
       var commm = typeof (val) == "string" && /.*[\u4e00-\u9fa5]+.*$/.test(val) ? val : "";
        return "/// " + commm + "\r\n";
    },
    convert: function (jsonObj) {
        this._allClass = [];
        return this._genClassCode(jsonObj);
    }
}

