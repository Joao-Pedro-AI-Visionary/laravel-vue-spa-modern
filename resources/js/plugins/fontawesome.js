import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faUser, faLock, faRightFromBracket, faGear, faMoon, faSun, faEye, faEyeSlash,
  faCircleExclamation, faCircleCheck, faCheck, faArrowRight, faArrowLeft, faBolt,
  faLayerGroup, faShieldHalved, faLanguage, faFlaskVial, faGauge, faXmark, faKey,
  faEnvelope, faRotate, faUserPen, faCubes, faChevronDown, faTerminal
} from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLaravel, faVuejs, faDocker, faPhp, faBootstrap } from '@fortawesome/free-brands-svg-icons'
import '@fortawesome/fontawesome-svg-core/styles.css'

config.autoAddCss = false

library.add(
  faUser, faLock, faRightFromBracket, faGear, faMoon, faSun, faEye, faEyeSlash,
  faCircleExclamation, faCircleCheck, faCheck, faArrowRight, faArrowLeft, faBolt,
  faLayerGroup, faShieldHalved, faLanguage, faFlaskVial, faGauge, faXmark, faKey,
  faEnvelope, faRotate, faUserPen, faCubes, faChevronDown, faTerminal,
  faGithub, faLaravel, faVuejs, faDocker, faPhp, faBootstrap
)

export { FontAwesomeIcon }
