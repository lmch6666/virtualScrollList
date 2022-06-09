class VirtualScroll {
  #recordScrollTop
  #topHiddenItem = 0
  #lastHiddenItem = 0 
  constructor({
    element,
    containerheight,
    data,
    itemHeight,
    pagesize,
    createEle,
    loadContent
  }){
    // 挂载元素
    this.element = typeof element == 'string' ? document.querySelector(element) : element;
    this.containerheight = containerheight;
    // 渲染数据
    this.data = data;
    // 每项高度
    this.itemHeight = itemHeight
    // 每页数据
    this.pagesize = pagesize;
    
    this.createEle = createEle
    this.loadContent = loadContent
    const container = document.createElement('div')
    this.contentbox = container
    container.style.width = '100%'
    this.element.appendChild(container)
    this.init()
  }

  init(){
    const scroll = this.element.getBoundingClientRect()
    const mincount = Math.ceil(Math.ceil(scroll.height) / this.itemHeight)
    const page = Math.ceil(mincount / this.pagesize)
    const items = this.loadContent(page * this.pagesize)
    this.data.push(...items)
    this.#genterContent(items)
    this.element.addEventListener('scroll', this.#scroll)
  }

  #renderItem(content, index){
    const ele = this.createEle(content)
    ele.style.height = this.itemHeight +'px'
    ele.dataset.index = index + 1
    ele.style.width = '100%'
    return ele
  }

  #genterContent(list){
    const container = this.contentbox
    list.forEach((item, index) => {
      const ele = this.#renderItem(item, index)
      container.appendChild(ele)
    })
  }

  #scroll = (event) => {
    const { scrollTop , clientHeight, scrollHeight} = event.target
    // 滚动区域总高度 - (滚动条离顶部的距离 + 容器总的高度) 判断滚动条离底部多少距离
    if(scrollHeight - (scrollTop + clientHeight) < 10){
      console.log('加载更多');
      let items = this.loadContent(this.pagesize)
      this.data.push(...items)
    }
    const direction = scrollTop > this.#recordScrollTop ? 'down' : 'up'
    this.#toUp(direction)
    this.#toDown(direction)
    this.#recordScrollTop = scrollTop
  }

  #toUp(direction){
    const { scrollTop } = this.element
    // 视图中显示的第一个元素的索引
    const firstVisibleItemIndex = Math.floor(scrollTop / this.itemHeight)
    const firstExitingItemIndex = firstVisibleItemIndex
    const rowitems = this.contentbox.children
    // 向上的时候，需要把视图中的元素添加到顶部
    if(direction == 'up'){
      for (let i = this.#topHiddenItem - 1; i >= firstExitingItemIndex; i--) {
        let ele = this.data[i]
        const item = this.#renderItem(ele, i)
        this.contentbox.prepend(item)
      }
    }
    // 向下的时候 需要把视图之外的元素删除
    if(direction == 'down'){
      // 将顶部的元素删除
      for (let i = this.#topHiddenItem; i < firstExitingItemIndex; i++) {
         if(rowitems[0]){
          rowitems[0].remove()
         }
      }
    }
    this.#topHiddenItem = firstExitingItemIndex;
    // 用 padding 来填充隐藏区域
    this.contentbox.style.paddingTop = (this.itemHeight * this.#topHiddenItem) + 'px'
  }

  #toDown(direction){
    const {scrollTop ,clientHeight} = this.element
    // 视图中显示的最后一个元素的索引
    const lastVisibleItemIndex = Math.ceil((scrollTop + clientHeight) / this.itemHeight)
    const lastExitingItemIndex = lastVisibleItemIndex
    const rowitems = [...this.contentbox.children]
    // 向下的时候，需要把视图中的元素添加到底部
    if(direction == 'down'){
      // 把上面隐藏元素的个数添加到底部
      for(let i= this.#topHiddenItem + rowitems.length; i < lastExitingItemIndex; i++){
        let ele = this.data[i]
        const item = this.#renderItem(ele, i)
        this.contentbox.appendChild(item)
      }
    }
    // 向上的时候 需要把视图之外的元素删除
    if(direction == 'up'){
      // 将底部的元素删除
      for(let i = lastExitingItemIndex; i < this.data.length; i++){
       let ele = rowitems[i - this.#topHiddenItem]
       if(ele){
          ele.remove()
       }
      }
    }
    const bottomHiddenItem = Math.max(0, this.data.length - (this.#topHiddenItem + this.contentbox.children.length))
    // 用 padding 来填充隐藏区域
    this.contentbox.style.paddingBottom = bottomHiddenItem * this.itemHeight + 'px'
  }
  

}

const vs = new VirtualScroll({
  element: '#virtualscroll',
  containerheight: '80vh',
  pagesize: 100,
  itemHeight: 50,
  data: [],
  createEle: (data) => {
    const div = document.createElement('div')
    div.classList.add('item')
    div.textContent = data
    return div
  },
  loadContent: function (pageSize) {
    const data = [];
    for (let i = 1; i <= pageSize; i++) {
      const dataItem = `I'm number ${ this.data.length + i}`;
      data.push(dataItem);
    }
    return data;
  }
})

