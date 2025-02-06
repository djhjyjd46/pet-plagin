const pageEl = document.querySelector('#page');
const sectionBlock = document.querySelector('.right-block');
const newBlock = document.createElement('div');
const dataPostEl = document.querySelectorAll('.data-post');

const arrDate = [...dataPostEl].map(item => item.textContent).slice(0, 5)

console.log(arrDate);


render()
function render() {
    const dataUlEl = document.createElement('ul');
    newBlock.append(dataUlEl)
    dataUlEl.classList.add('block-list')
    
    sectionBlock.append(newBlock)
    newBlock.classList.add('new-box')
     
    arrDate.forEach(item => {
        const dataLiEl = document.createElement('li');
        dataLiEl.textContent = item
        dataUlEl.append(dataLiEl)
    });

}
