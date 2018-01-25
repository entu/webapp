import entityContent from '../content/content.vue'



export default {
    name: 'EntityList',
    components: {
        'entity-content': entityContent
    },
    data () {
        return {
            entities: [
                {
                    id: '1',
                    title: 'Cras tempor euismod mauris dui lacus',
                    description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                    img: 'https://lorempixel.com/100/100/abstract/'
                },
                {
                    id: '2',
                    title: 'Curabitur sit amet',
                    img: 'https://lorempixel.com/100/100/animals/'
                },
                {
                    id: '3',
                    title: 'Vestibulum eu metus',
                    description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                    img: 'https://lorempixel.com/100/100/business/'
                },
                {
                    id: '4',
                    title: 'Cras tempor dui lacus',
                    description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                    img: 'https://lorempixel.com/100/100/cats/'
                },
                {
                    id: '5',
                    title: 'Curabitur sit amet',
                    description: 'Vivamus ultrices augue ipsum, vitae pellentesque elit imperdiet vitae.',
                    img: 'https://lorempixel.com/100/100/city/'
                },
                {
                    id: '6',
                    title: 'Vestibulum eu metus',
                    description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                    img: 'https://lorempixel.com/100/100/fashion/'
                },
                {
                    id: '7',
                    title: 'Cras tempor dui lacus',
                    description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                    img: 'https://lorempixel.com/100/100/food/'
                },
                {
                    id: '8',
                    title: 'Curabitur sit amet',
                    description: 'Vivamus ultrices augue ipsum, vitae pellentesque elit imperdiet vitae.',
                    img: 'https://lorempixel.com/100/100/nature/'
                },
                {
                    id: '9',
                    title: 'Vestibulum eu metus',
                    description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                    img: 'https://lorempixel.com/100/100/nightlife/'
                },
                {
                    id: '10',
                    title: 'Cras tempor dui lacus',
                    description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                    img: 'https://lorempixel.com/100/100/people/'
                },
                {
                    id: '11',
                    title: 'Vestibulum eu metus',
                    description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                    img: 'https://lorempixel.com/100/100/sports/'
                },
                {
                    id: '12',
                    title: 'Cras tempor dui lacus',
                    description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                    img: 'https://lorempixel.com/100/100/technics/'
                },
                {
                    id: '13',
                    title: 'Vestibulum eu metus',
                    description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                    img: 'https://lorempixel.com/100/100/technics/'
                },
                {
                    id: '14',
                    title: 'Cras tempor dui lacus',
                    description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                    img: 'https://lorempixel.com/100/100/transport/'
                }
            ]
        }
    }
}
