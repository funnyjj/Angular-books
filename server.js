/**
 * Created by Administrator on 2017/3/14.
 */
var http=require('http'),
    fs=require('fs'),
    url=require('url'),
    mime=require('mime');
function readBook(callBack) {
    fs.readFile('./book.json','utf8',function (err,data) {
        if(err||data=='') data='[]';
        data=JSON.parse(data);
        callBack(data);
    })
}

function writeBook(data,callBack) {
    fs.writeFile('./book.json',JSON.stringify(data),callBack);
}
http.createServer(function (req,res) {
    let urlObj=url.parse(req.url,true);
    let{pathname,query}=urlObj;
    if(pathname=='/'){
        res.setHeader('content-type','text/html;charset="utf8"');
        fs.createReadStream('./index.html').pipe(res);
    }else if(/^\/book(\/\d+)?$/.test(pathname)){
        var id=/^\/book(?:\/(\d+))?$/.exec(pathname)[1];
        switch(req.method){
            case 'PUT':
                if(id){
                    var str='';
                    req.on('data',function (data) {
                        str+=data;
                    });
                    req.on('end',function () {
                        var book=JSON.parse(str);
                        readBook(function (data) {
                            data=data.map(function (item) {
                                if(item.bookId==id){
                                    return book;
                                }
                                return item;
                            });
                            writeBook(data,function () {
                                res.end(JSON.stringify(book));
                            })
                        })
                    })
                }
                break;
            case 'POST':
                var str='';
                req.on('data',function (data) {
                    str+=data;
                });
                req.on('end',function () {
                    var book=JSON.parse(str);
                    readBook(function (data) {
                        book.bookId=data.length?data[data.length-1].bookId+1:1;
                        data.push(book);
                        writeBook(data,function () {
                            res.end(JSON.stringify(book));
                        })
                    })
                });
                break;
            case 'DELETE':
                if(id){
                    readBook(function (data) {
                        data=data.filter(function (item) {
                            return id!=item.bookId;
                        });
                        writeBook(data,function () {
                            res.end(JSON.stringify({}));
                        })
                    })
                }
                break;
            case 'GET':
                if(id){
                    readBook(function (data) {
                        res.end(JSON.stringify(data.find(function (item) {
                return id==item.bookId;
                        })))
                    })
                }else{
                    readBook(function (data) {
                        res.end(JSON.stringify(data));
                    })
                }
                break;
        }
    }

    else{
        fs.exists('.'+pathname,function (flag) {
            if(flag){
                res.setHeader('content-type',mime.lookup(pathname)+';charset=utf8');
                fs.createReadStream('.'+pathname).pipe(res);
            }else{
                res.statusCode=404;
                res.end('not found');
            }
        })
    }
}).listen(8080);